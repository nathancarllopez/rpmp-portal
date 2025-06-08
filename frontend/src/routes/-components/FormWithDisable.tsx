import { Button, Center, Paper } from "@mantine/core";
import { useRouterState } from "@tanstack/react-router";
import { useRef, type FormEvent } from "react";

interface SubmitButtonLabels {
  label: string;
  disabledLabel: string;
}

interface FormWithStateProps {
  margins?: Record<string, number>;
  submitButtonLabels: SubmitButtonLabels;
  submitButtonStyle?: Record<string, any>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void> | void;
  children: React.ReactNode;
}

export default function FormWithDisable({
  margins,
  submitButtonLabels,
  submitButtonStyle = {
    fullWidth: true,
    mt: "xl",
  },
  onSubmit,
  children,
}: FormWithStateProps) {
  const isLoading = useRouterState({ select: (state) => state.isLoading });
  const isSubmittingRef = useRef(false);
  const isDisabled = isSubmittingRef.current || isLoading;

  const { label, disabledLabel } = submitButtonLabels;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    isSubmittingRef.current = true;

    try {
      await onSubmit(e);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Paper {...margins} pos={"relative"}>
      <form onSubmit={handleSubmit}>
        <fieldset
          disabled={isDisabled}
          style={{ all: "unset", display: "contents" }}
        >
          {children}
          <Center>
            <Button type="submit" {...submitButtonStyle}>
              {isDisabled ? disabledLabel : label}
            </Button>
          </Center>
        </fieldset>
      </form>
    </Paper>
  );
}