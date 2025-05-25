import { useRouterState } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

interface FormWithStateProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  children: React.ReactNode;
}

export default function FormWithDisable({
  onSubmit,
  children,
}: FormWithStateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoading = useRouterState({ select: (state) => state.isLoading });
  const isDisabled = isSubmitting || isLoading;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset
        disabled={isDisabled}
        style={{ all: "unset", display: "contents" }}
      >
        {children}
      </fieldset>
    </form>
  );
}
