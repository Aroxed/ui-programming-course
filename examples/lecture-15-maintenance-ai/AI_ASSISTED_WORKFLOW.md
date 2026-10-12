# AI-assisted maintenance workflow

Generative AI is treated here as a **proposal and analysis tool**, not as an authority over the repository.

## A useful request structure

Provide the model with:

1. the exact change request and acceptance criteria;
2. only the relevant source files and tests;
3. constraints that must remain unchanged;
4. the expected output form, for example a minimal patch plus a list of assumptions;
5. an explicit instruction not to invent unavailable APIs, files, dependencies, or requirements.

Example request:

> Add the priority filter described in CHANGE_REQUEST.md. Preserve the existing search and status behavior. Keep native labelled form controls. Do not add dependencies. Propose the smallest patch to App.jsx and taskModel.js and identify which existing tests must remain green. State any assumption before changing behavior.

## Verification loop

An AI-generated proposal is not accepted directly. The developer must:

- inspect every changed line;
- compare the patch with the acceptance criteria;
- reject unrelated refactoring;
- run the relevant automated tests;
- perform the necessary manual UI checks;
- inspect accessibility and error states affected by the change;
- check that no secrets, credentials, personal data, or unsupported dependencies were introduced;
- be able to explain why the final code works and modify it without AI assistance.

## Typical failure modes

- invented library APIs or configuration fields;
- code based on an older version of a framework;
- broad refactoring when a local change is sufficient;
- a test that repeats the same incorrect assumption as the generated implementation;
- removal of error handling or accessibility semantics while simplifying code;
- new dependencies without a justified need;
- confident explanations unsupported by the actual repository.

## Course principle

AI may accelerate reading, hypothesis generation, patch drafting, test drafting, documentation, and review. Responsibility for correctness, understanding, verification, and defence of the technical decision remains with the student.
