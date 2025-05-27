import { LoadingOverlay, Paper } from "@mantine/core";
import { useRouterState } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

interface FormWithStateProps {
  margins?: Record<string, number>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  children: React.ReactNode;
}

export default function FormWithDisable({
  margins,
  onSubmit,
  children,
}: FormWithStateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isLoading = useRouterState({ select: (state) => state.isLoading });
  const isDisabled = isSubmitting || isLoading;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // I want to force react to flush the call the setIsSubmitting before calling onSubmit
    // I should probably think of a better way to do this...
    setTimeout(async () => {
      try {
        await onSubmit(e);
      } finally {
        setIsSubmitting(false);
      }
    }, 0);
  };

  return (
    <Paper {...margins} pos={"relative"}>
      <LoadingOverlay visible={isDisabled} zIndex={100}/>
      <form onSubmit={handleSubmit}>
        <fieldset
          disabled={isDisabled}
          style={{ all: "unset", display: "contents" }}
        >
          {children}
        </fieldset>
      </form>
    </Paper>
  );
}
