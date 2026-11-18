"""Verify datasets, saved chart queries, and the least-privilege embedded flow."""
import json
import os
import requests
from superset.app import create_app
from flask import g

app = create_app()
with app.app_context():
    from superset import db, security_manager
    from superset.models.slice import Slice
    from superset.models.dashboard import Dashboard
    from superset.common.query_context_factory import QueryContextFactory
    from superset.commands.chart.data.get_data_command import ChartDataCommand
    with app.test_request_context():
        g.user = security_manager.find_user(username='fleetflow-admin')
        dashboard = db.session.query(Dashboard).filter_by(slug='fleetflow-operations').one()
        dashboard_id = dashboard.id
        charts = dashboard.slices
        assert len(charts) == 21, len(charts)
        guest_contexts = {}
        for chart in charts:
            form = json.loads(chart.params)
            metrics = form.get('metrics')
            if metrics is None:
                metric = form.get('metric')
                metrics = [metric] if metric else []
            if chart.viz_type != 'deck_scatter':
                assert all(metrics), (chart.slice_name, 'missing metric configuration')
            query = {
                'columns': form.get('groupby', []),
                'metrics': metrics,
                'filters': [], 'extras': {}, 'time_range': 'No filter',
                'row_limit': form.get('row_limit', 1000),
                'orderby': [],
            }
            if chart.viz_type == 'echarts_timeseries_line':
                query.update(is_timeseries=True, granularity='event_date', extras={'time_grain_sqla': 'P1M'})
            context = {'datasource': {'id': chart.datasource_id, 'type': 'table'}, 'queries': [query], 'result_format': 'json', 'result_type': 'full', 'force': True}
            guest_contexts.setdefault(chart.datasource_id, (chart.slice_name, context))
            if os.environ.get('VERIFY_GUEST_ONLY') == '1':
                continue
            command = ChartDataCommand(QueryContextFactory().create(**context))
            command.validate()
            result = command.run()
            for item in result['queries']:
                assert not item.get('error'), (chart.slice_name, item.get('error'))
            print('PASS', chart.slice_name)

base = 'http://localhost:8088'
session = requests.Session()
login = session.post(base + '/api/v1/security/login', json={'username': 'fleetflow-embed-service', 'password': os.environ['SUPERSET_EMBED_PASSWORD'], 'provider': 'db', 'refresh': False}, timeout=20)
login.raise_for_status()
session.headers['Authorization'] = 'Bearer ' + login.json()['access_token']
csrf = session.get(base + '/api/v1/security/csrf_token/', timeout=20)
csrf.raise_for_status()
session.headers['X-CSRFToken'] = csrf.json()['result']
session.headers['Cookie'] = csrf.headers['set-cookie'].split(';', 1)[0]
token = session.post(base + '/api/v1/security/guest_token/', json={'resources': [{'type': 'dashboard', 'id': 'd0f7c674-0177-4b8f-9743-c27fabab931a'}], 'rls': [], 'user': {'username': 'verification'}}, timeout=20)
assert token.status_code == 200, (token.status_code, token.text)
guest = requests.Session()
guest.headers['X-GuestToken'] = token.json()['token']
for chart_name, context in guest_contexts.values():
    chart_data = guest.post(base + '/api/v1/chart/data', json=context, timeout=70)
    assert chart_data.status_code == 200, (chart_name, chart_data.status_code, chart_data.text)
    payload = chart_data.json()
    assert not payload.get('errors'), (chart_name, payload.get('errors'))
    assert not payload['result'][0].get('error'), (chart_name, payload['result'][0].get('error'))
    print('PASS guest data', chart_name)
response = guest.get(base + '/api/v1/dashboard/' + str(dashboard_id), timeout=20)
assert response.status_code == 200, response.status_code
response = guest.get(base + '/api/v1/dashboard/' + str(dashboard_id) + '/charts', timeout=20)
assert response.status_code == 200, response.status_code
assert len(response.json()['result']) == 21
embedded = requests.get(
    base + '/embedded/d0f7c674-0177-4b8f-9743-c27fabab931a',
    headers={'Referer': 'http://localhost:3000/admin/analytics'},
    timeout=20,
)
assert embedded.status_code == 200, embedded.status_code
assert 'http://localhost:3000' in embedded.headers.get('Content-Security-Policy', '')
print('PASS embedded guest can read the dashboard and all 21 chart definitions')
