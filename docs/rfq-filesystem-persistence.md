# RFQ filesystem persistence

Phase 31E-FIX corrects record replacement in the local filesystem RFQ adapter. It does not change the RFQ API, enquiry schema, validation, notification order, Payload collections, PostgreSQL storage or production deployment architecture.

## Root cause

`FilesystemEnquiryRepository.updateNotificationStatus()` previously wrote the updated record to a uniquely named `.tmp` file in the record directory and called `rename(temp, destination)`. POSIX permits that rename to atomically replace an existing file. The project’s Windows environment returns `EPERM` when the destination already exists. A standalone reproduction confirmed that the unchanged destination retained the old JSON and the new `.tmp` file remained beside it. The failure occurs without an open application handle, so destination replacement semantics are sufficient to reproduce it; antivirus or indexing is not required.

## Replacement path

`replaceFileAtomically()` keeps the same-directory temporary file and first attempts the POSIX atomic rename. The temporary file is opened exclusively, written, flushed with `FileHandle.sync()` and closed before installation.

If rename-over-existing returns `EACCES`, `EEXIST` or `EPERM`, the Windows-compatible fallback:

1. Reads the current destination.
2. Creates a unique, exclusive backup copy in the same directory.
3. Byte-verifies the backup against the current destination.
4. Removes the destination only after the verified backup exists.
5. Exclusively copies the fully written temporary file into the destination.
6. Byte-verifies the installed destination against the temporary file.
7. Removes the backup and temporary files after success.

The fallback has a short interval in which the canonical destination path is absent, but the verified old record remains in the backup and the complete new record remains in the temporary file. This is the necessary Windows tradeoff where atomic rename-over-existing is unavailable. A fragile unguarded copy-delete sequence is not used.

## Failure and concurrency behavior

If installation fails, the partial destination is removed and the verified backup is copied back and verified before the original error is returned. Temporary files are removed in failure and success paths. If restoration itself fails, the backup is intentionally retained as the last valid copy and the repository throws `EnquiryStorageError`; filesystem paths are not returned through the public RFQ API.

Updates to the same record are serialized within a repository instance. Different submissions retain independent UUID filenames and are not globally blocked. Record creation continues to use exclusive `wx` writes, so duplicate IDs and partial new records remain prevented.

## Validation coverage

The RFQ validator covers initial creation, replacement of an existing destination, repeated updates, successful cleanup, failure cleanup, restoration of existing data, valid JSON, simulated Windows replacement behavior, simulated POSIX direct-rename behavior, concurrent same-record updates and isolated temporary-directory teardown.
