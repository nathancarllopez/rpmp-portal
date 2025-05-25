import { createTheme, Paper } from "@mantine/core";

export const theme = createTheme({
  components: {
    Paper: Paper.extend({
      defaultProps: {
        shadow: "md",
        radius: "md",
        withBorder: true,
        p: 30,
        mt: 5
      }
    })
  }
});