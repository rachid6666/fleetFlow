"""Idempotently provision FleetFlow-owned assets; source database is queried read-only."""
import json
import os
import re
import uuid
from pathlib import Path
from superset.app import create_app

ROOT = Path(__file__).parent
EMBED_ID = 'd0f7c674-0177-4b8f-9743-c27fabab931a'

def provision():
    from superset import db, security_manager as sm
    from superset.models.core import Database, Theme
    from superset.connectors.sqla.models import SqlaTable
    from superset.models.slice import Slice
    from superset.models.dashboard import Dashboard
    from superset.models.embedded_dashboard import EmbeddedDashboard

    admin = sm.find_user(username='fleetflow-admin')
    if not admin:
        admin = sm.add_user('fleetflow-admin', 'FleetFlow', 'Admin', 'admin@fleetflow.local', sm.find_role('Admin'), os.environ['SUPERSET_ADMIN_PASSWORD'])
    service_role = sm.add_role('FleetFlowTokenIssuer')
    sm.add_permission_role(service_role, sm.find_permission_view_menu('can_grant_guest_token', 'SecurityRestApi'))
    sm.add_permission_role(service_role, sm.find_permission_view_menu('can_read', 'SecurityRestApi'))
    if not sm.find_user(username='fleetflow-embed-service'):
        sm.add_user('fleetflow-embed-service', 'FleetFlow', 'Embed', 'embed@fleetflow.local', service_role, os.environ['SUPERSET_EMBED_PASSWORD'])
    database = db.session.query(Database).filter_by(database_name='FleetFlow analytics').one_or_none()
    if database is None:
        database = Database(database_name='FleetFlow analytics')
        db.session.add(database)
    database.sqlalchemy_uri = os.environ['FLEETFLOW_DATABASE_URL']
    database.expose_in_sqllab = False
    database.allow_dml = False
    database.allow_ctas = False
    database.allow_cvas = False
    database.cache_timeout = 300
    database.extra = json.dumps({'engine_params': {'connect_args': {'options': '-c default_transaction_read_only=on -c statement_timeout=60000'}}})
    db.session.commit()
    light_theme = {
        'algorithm': 'default',
        'token': {
            'colorPrimary': '#0F766E',
            'colorSuccess': '#16A34A',
            'colorWarning': '#D97706',
            'colorError': '#DC2626',
            'colorInfo': '#0891B2',
            'colorBgBase': '#F5F8F7',
            'colorBgContainer': '#FFFFFF',
            'colorBgElevated': '#FFFFFF',
            'colorTextBase': '#102A2A',
            'colorBorder': '#D8E4E1',
            'borderRadius': 10,
            'fontFamily': "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
    }
    for theme_name, is_dark in (('THEME_DEFAULT', False), ('THEME_DARK', True)):
        theme = db.session.query(Theme).filter_by(theme_name=theme_name, is_system=True).one_or_none()
        if theme is None:
            theme = Theme(theme_name=theme_name, is_system=True)
            db.session.add(theme)
        theme.json_data = json.dumps(light_theme)
        theme.is_system_default = not is_dark
        theme.is_system_dark = is_dark
    db.session.commit()
    datasets = {}
    guest_role = sm.find_role('Gamma')
    for key, sql in json.loads((ROOT / 'datasets.json').read_text()).items():
        name = 'fleetflow_' + key
        table = db.session.query(SqlaTable).filter_by(database_id=database.id, table_name=name).one_or_none()
        if table is None:
            table = SqlaTable(table_name=name, database_id=database.id, schema='public', owners=[admin])
            db.session.add(table)
        table.sql = sql
        table.cache_timeout = 300
        db.session.commit()
        table.fetch_metadata()
        if key not in ('branches', 'facilities'):
            table.main_dttm_col = 'event_date'
        sm.add_permission_view_menu('datasource_access', table.perm)
        dataset_permission = sm.find_permission_view_menu('datasource_access', table.perm)
        if dataset_permission and guest_role:
            sm.add_permission_role(guest_role, dataset_permission)
        datasets[key] = table
    db.session.commit()
    dashboard = db.session.query(Dashboard).filter_by(slug='fleetflow-operations').one_or_none()
    if dashboard is None:
        dashboard = Dashboard(slug='fleetflow-operations', owners=[admin])
        db.session.add(dashboard)
    dashboard.dashboard_title = 'FleetFlow · Operations intelligence'
    dashboard.published = True
    dashboard.css = (ROOT / 'dashboard.css').read_text()
    db.session.commit()

    def metric(sql, label):
        option = re.sub(r'[^a-z0-9]+', '_', label.lower()).strip('_')
        return {
            'expressionType': 'SQL',
            'sqlExpression': sql,
            'label': label,
            'hasCustomLabel': True,
            'optionName': f'metric_{option}',
        }

    charts = []
    def chart(title, key, viz='big_number_total', sql='COUNT(*)', label='Count', group=None, **options):
        dataset = datasets[key]
        legacy_name = 'FleetFlow · ' + title
        item = db.session.query(Slice).filter_by(slice_name=title).one_or_none()
        if item is None:
            item = db.session.query(Slice).filter_by(slice_name=legacy_name).one_or_none()
        if item is None:
            item = Slice(slice_name=title, owners=[admin], datasource_id=dataset.id, datasource_type='table', viz_type=viz)
            db.session.add(item)
        item.slice_name = title
        form = {'datasource': f'{dataset.id}__table', 'viz_type': viz, 'time_range': 'No filter', 'adhoc_filters': [], 'row_limit': 1000, 'color_scheme': 'fleetflow', 'number_format': ',.0f', **options}
        if viz == 'big_number_total':
            form['metric'] = metric(sql, label)
        elif viz == 'pie':
            form['metric'] = metric(sql, label)
            form['groupby'] = group or []
        elif viz == 'deck_scatter':
            form['metrics'] = []
            form['groupby'] = group or []
            form.update({
                'spatial': {'type': 'latlong', 'latCol': 'latitude', 'lonCol': 'longitude'},
                'mapbox_style': 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                'point_radius_fixed': {'type': 'fix', 'value': 500},
                'point_unit': 'square_m',
                'multiplier': 1,
                'min_radius': 7,
                'max_radius': 20,
                'color_picker': {'r': 15, 'g': 118, 'b': 110, 'a': 1},
                'viewport': {'latitude': 39.2, 'longitude': -96.5, 'zoom': 3.2, 'bearing': 0, 'pitch': 0},
            })
        else:
            form['metrics'] = [metric(sql, label)]
            form['groupby'] = group or []
        if viz == 'pie':
            form.update(donut=True, innerRadius=36, show_labels=True, show_legend=True, legendType='scroll')
        if viz == 'table':
            form.update(query_mode='aggregate', page_length=10, order_desc=True, include_search=True)
        item.datasource_id = dataset.id
        item.datasource_type = 'table'
        item.viz_type = viz
        item.params = json.dumps(form)
        # Superset can regenerate query context from saved form data when absent.
        item.query_context = None
        item.dashboards = [dashboard]
        db.session.flush()
        charts.append(item)
        return item.id

    tabs_id = 'TABS-FLEETFLOW'
    layout = {
        'DASHBOARD_VERSION_KEY': 'v2',
        'ROOT_ID': {'id': 'ROOT_ID', 'type': 'ROOT', 'children': [tabs_id]},
        tabs_id: {'id': tabs_id, 'type': 'TABS', 'children': [], 'parents': ['ROOT_ID'], 'meta': {}},
    }
    def tab(tab_id, text):
        layout[tabs_id]['children'].append(tab_id)
        layout[tab_id] = {'id': tab_id, 'type': 'TAB', 'children': [], 'parents': ['ROOT_ID', tabs_id], 'meta': {'text': text}}
    def row(tab_id, ids, height=32):
        rid = f'ROW-{len(layout)}'
        layout[tab_id]['children'].append(rid)
        layout[rid] = {'id': rid, 'type': 'ROW', 'children': [], 'parents': ['ROOT_ID', tabs_id, tab_id], 'meta': {'background': 'BACKGROUND_TRANSPARENT'}}
        for cid in ids:
            nid = f'CHART-{cid}'
            layout[rid]['children'].append(nid)
            layout[nid] = {'id': nid, 'type': 'CHART', 'children': [], 'parents': ['ROOT_ID', tabs_id, tab_id, rid], 'meta': {'chartId': cid, 'width': 12 // len(ids), 'height': height}}

    overview_tab = 'TAB-OVERVIEW'
    revenue_tab = 'TAB-REVENUE'
    service_tab = 'TAB-SERVICE'
    costs_tab = 'TAB-COSTS'
    live_tab = 'TAB-LIVE'
    tab(overview_tab, 'Overview')
    tab(revenue_tab, 'Revenue detail')
    tab(service_tab, 'Service quality')
    tab(costs_tab, 'Costs & fleet')
    tab(live_tab, 'Live operations')

    row(overview_tab, [chart('Total loads', 'loads'), chart('Recorded revenue', 'loads', sql='SUM(revenue)', label='Revenue', y_axis_format='$,.0f'), chart('Miles driven', 'loads', sql='SUM(actual_distance_miles)', label='Miles'), chart('Fuel efficiency', 'loads', sql='SUM(actual_distance_miles) / NULLIF(SUM(fuel_gallons_used), 0)', label='MPG', y_axis_format='.2f')], 18)
    row(overview_tab, [chart('Facility network map', 'facilities', 'deck_scatter', 'COUNT(*)', 'Facilities', ['facility_id', 'facility_name', 'facility_type', 'city', 'state', 'latitude', 'longitude'])], 46)
    row(overview_tab, [chart('Monthly revenue', 'loads', 'echarts_timeseries_line', 'SUM(revenue)', 'Revenue', x_axis='event_date', granularity_sqla='event_date', time_grain_sqla='P1M', show_legend=False, y_axis_format='$,.0f'), chart('Load status', 'loads', 'pie', group=['load_status'])], 36)
    row(revenue_tab, [chart('Top customers', 'loads', 'table', 'SUM(revenue)', 'Revenue', ['customer_name'], row_limit=10, number_format='$,.0f'), chart('Top routes', 'loads', 'table', 'SUM(revenue)', 'Revenue', ['route'], row_limit=10, number_format='$,.0f')], 42)
    row(service_tab, [chart('On-time event rate', 'delivery', sql='AVG(on_time)', label='On time', y_axis_format='.1%'), chart('Safety incidents', 'safety'), chart('Facility detention', 'delivery', 'table', 'AVG(detention_minutes)', 'Average minutes', ['facility_name'], row_limit=10)], 20)
    row(service_tab, [chart('On-time by event type', 'delivery', 'table', 'AVG(on_time)', 'On time', ['event_type'], number_format='.1%'), chart('Safety incident types', 'safety', 'pie', group=['incident_type'])], 34)
    row(costs_tab, [chart('Operating spend', 'costs', sql='SUM(total_cost)', label='Spend', y_axis_format='$,.0f'), chart('Fleet utilization', 'fleet', sql='AVG(utilization_rate)', label='Utilization', y_axis_format='.1%'), chart('Monthly operating costs', 'costs', 'echarts_timeseries_line', 'SUM(total_cost)', 'Cost', ['cost_type'], x_axis='event_date', granularity_sqla='event_date', time_grain_sqla='P1M', show_legend=True, y_axis_format='$,.0f')], 22)
    row(live_tab, [chart('Live shipments', 'shipments'), chart('Exceptions', 'shipments', sql='COUNT(*) FILTER (WHERE exception_count = 1)', label='Exceptions'), chart('No update for 24h', 'shipments', sql='COUNT(*) FILTER (WHERE stale_count = 1)', label='Stale'), chart('Unassigned shipments', 'shipments', sql='COUNT(*) FILTER (WHERE unassigned_count = 1)', label='Unassigned')], 22)

    dashboard.slices = charts
    dashboard.position_json = json.dumps(layout)
    dashboard.json_metadata = json.dumps({'color_scheme': 'fleetflow', 'refresh_frequency': 300})
    embed = db.session.query(EmbeddedDashboard).filter_by(dashboard_id=dashboard.id).one_or_none()
    if embed is None:
        embed = EmbeddedDashboard(dashboard_id=dashboard.id, uuid=uuid.UUID(EMBED_ID))
        db.session.add(embed)
    embed.allow_domain_list = os.environ.get('FLEETFLOW_ORIGIN', 'http://localhost:3000')
    db.session.commit()
    print(f'FleetFlow dashboard ready: /superset/dashboard/fleetflow-operations/ ({len(charts)} charts)')

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        provision()
