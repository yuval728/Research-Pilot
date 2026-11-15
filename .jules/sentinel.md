## 2025-05-20 - Enforce Paper Access Authorization on Composite Bundle Endpoints
**Vulnerability:** Composite service methods like `ExportService.get_output_bundle` queried child records (`ExtractionORM`) without enforcing parent `PaperORM` authorization, which allowed unauthorized users to retrieve private paper extraction metadata.
**Learning:** Entity bundle endpoints that combine multiple child queries must check parent paper visibility (`PaperORM.user_id == user_id OR PaperORM.is_public`) at the start of the method before querying child tables.
**Prevention:** Always perform an upfront paper access authorization query in service methods before fetching associated child records.
