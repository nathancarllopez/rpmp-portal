To generate types for supabase, run the following command from the rpmp-porta/types folder:

```bash
# "$PROJECT_REF" can be found in the root .env file
npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > database.types.ts
```