"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AutoSubmitFormProps = {
  action: () => Promise<void>;
  children: ReactNode;
};

export function AutoSubmitForm({ action, children }: AutoSubmitFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={action}>
      {children}
    </form>
  );
}
