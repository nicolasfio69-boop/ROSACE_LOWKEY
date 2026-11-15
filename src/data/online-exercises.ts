/** Hand-written, self-contained fictional tasks. Nothing submitted here is executed. */
export type OnlineExerciseSpec = {
  minutes: number;
  inputs: string;
  tasks: [string, string, string];
  checks: [string, string, string];
};
export const ONLINE_EXERCISES: Record<string, OnlineExerciseSpec> = {
  "C2.1": {
    minutes: 6,
    inputs:
      "Fictional team policy: use synthetic identifiers in shared logs; raw logs stay in the restricted incident folder; delete them after 7 days; exceptions require the policy owner's written approval. Cases: (a) share synthetic logs internally, (b) email raw identifiers externally, (c) keep raw logs for 30 days, (d) use the restricted folder for a 2-day incident, (e) follow a manager's verbal exception.",
    tasks: [
      "With the policy beside you, mark each case allowed or not allowed and quote the relevant rule. Hint: a verbal request is not written approval.",
      "Review the five cases independently. For each rejected case, give a compliant next action and identify any information needed before acting.",
      "The vendor now says raw logs are needed today and the policy owner is unavailable. Review the cases, propose a safe interim response, and write an escalation the team can follow without inventing an exception.",
    ],
    checks: [
      "Applies the stated policy to each case without inventing permissions",
      "Offers a concrete compliant alternative for blocked work",
      "Identifies the required authority and leaves unresolved exceptions explicit",
    ],
  },
  "C3.1": {
    minutes: 6,
    inputs:
      "Fictional demo: a sensor must show one reading per second by Friday. There are 12 engineer-hours left. The board arrives Thursday; a simulator is available now. A teammate owns hardware. The customer has not defined acceptable missing readings.",
    tasks: [
      "Using the headings outcome, tasks, owner and risk, write a small plan. Hint: clarify acceptance before promising completion and use the simulator while waiting.",
      "Independently scope a deliverable within 12 hours. Give estimates, dependencies, one acceptance question and a fallback if the board is late.",
      "The board is delayed until Friday morning and the customer adds a second sensor. Revise the scope, explain what is deferred and give the team checkpoints and a decision deadline.",
    ],
    checks: [
      "Defines a concrete outcome and checks unclear acceptance criteria",
      "Produces a feasible sequence with owners, estimates and dependencies",
      "Names a risk, a fallback and a clear scope decision",
    ],
  },
  "C3.2": {
    minutes: 6,
    inputs:
      "Fictional handover: release r7 ran for 30 minutes in the simulator. A manual reconnect fixed one lost connection. Hardware recovery is not tested. The next engineer starts tomorrow; the demonstration is Friday. Available artifacts: setup.md, simulator.log, source revision r7.",
    tasks: [
      "Fill a handover with: delivered, checked, not checked, next owner/action. Hint: distinguish a successful simulator run from a hardware test.",
      "Write an independently usable handover: reproduction steps for the reconnect issue, artifact references, remaining checks, owner and acceptance conditions.",
      "A teammate reports that r7 behaves differently on a new board and the customer asks for release today. Update the handover and release recommendation, including a fallback and how the next engineer can verify the decision.",
    ],
    checks: [
      "Separates delivered work, evidence and unresolved work",
      "Provides reproducible next steps and useful artifact references",
      "Makes ownership, acceptance and release uncertainty explicit",
    ],
  },
  "C5.2": {
    minutes: 20,
    inputs:
      "Explore a fictional log query tool from examples: input [{id:1,temp:18},{id:2,temp:24},{id:3,temp:24}]. Query 'keep temp >= 24' returns IDs 2,3. 'keep temp >= 24 | pick id' returns [2,3]. 'pick temp | unique' returns [18,24]. 'keep missing == 1' returns ERROR unknown field. No external tool is needed; write your experiments and predicted results.",
    tasks: [
      "With the examples as a guide, explain keep, pick and unique; write a query for unique temperatures at least 20; give a small test to check your understanding.",
      "Infer the tool's operations independently. Produce IDs whose temperature is at least 20, distinguish filtering from projection, and design two experiments for behavior not established by the examples.",
      "A new dataset includes {id:4,temp:null} and {id:5,temp:'24'}. Their comparison behavior is undocumented. Plan experiments that discriminate possible rules, state what cannot yet be concluded and write a safe usage note for teammates.",
    ],
    checks: [
      "Infers only behavior supported by the supplied examples",
      "Designs small experiments that distinguish plausible interpretations",
      "Shows a usable result and explicitly documents remaining uncertainty",
    ],
  },
  "J.PROTOCOLS": {
    minutes: 8,
    inputs:
      "Fictional SPI sensor: CS low starts a frame; send command 0x80, then two dummy bytes 0x00; the two received data bytes are a big-endian unsigned sample. CS must remain low for all three bytes. Trace: CS low, TX80/RX00, CS high, CS low, TX00/RX12, TX00/RX34, CS high.",
    tasks: [
      "Using the frame rule, find the CS error and draw a corrected transaction. Hint: big-endian bytes 0x12,0x34 form 0x1234.",
      "Correct the transaction independently, explain how to decode the sample, and propose checks for byte order and a truncated transfer.",
      "The same transaction fails intermittently after a second device joins the bus. Propose tests for CS ownership, clock settings and transfer interleaving; state evidence needed before blaming the sensor.",
    ],
    checks: [
      "Respects the stated frame and byte-order rules",
      "Provides a concrete transaction and boundary/failure checks",
      "Distinguishes protocol evidence from untested hardware assumptions",
    ],
  },
  "J.RTOS": {
    minutes: 8,
    inputs:
      "Fictional tasks: Sample runs every 10 ms and takes 2 ms; Log takes 12 ms and holds a shared buffer lock throughout; both use that lock. Requirement: Sample must finish within 5 ms of each release. You can queue messages; no hardware execution is required.",
    tasks: [
      "Using the timing numbers, show why Sample can miss its deadline. Hint: waiting for a 12 ms lock already exceeds 5 ms. Suggest a smaller critical section.",
      "Design an independent task/queue arrangement that bounds Sample's blocking. State queue size assumptions, overload behavior and a timing test.",
      "An interrupt now produces bursts of 20 samples while logging stalls for 100 ms. Revise the design with a bounded queue, an explicit loss policy and tests for priority inversion and worst-case response.",
    ],
    checks: [
      "Accounts for blocking as well as execution time",
      "Bounds shared work and defines queue/overload behavior",
      "Gives a testable timing argument rather than assuming priorities solve everything",
    ],
  },
  "J.HW_DEBUG": {
    minutes: 8,
    inputs:
      "Fictional board should run at 3.3 V. Recorded readings: idle supply 3.30 V, radio transmit supply 2.65 V, reset line falls low during transmit, UART prints BOOT repeatedly. Normal current limit is 200 mA; the supply was set to 80 mA.",
    tasks: [
      "Follow supply → reset → UART. Identify a likely cause and the next safe check. Hint: compare the configured current limit with the documented requirement.",
      "Investigate independently: separate evidence from hypotheses, propose safe measurements and define a test that distinguishes supply limiting from a firmware reset.",
      "Raising the limit fixes one board but not another, which still resets only when a probe is attached. Revise the investigation for grounding, measurement effects and firmware; write a safe test order for a colleague.",
    ],
    checks: [
      "Uses the provided electrical evidence and safe documented limits",
      "Separates likely causes from confirmed diagnoses",
      "Proposes discriminating measurements and a reproducible verification",
    ],
  },
  "J.DATASHEET": {
    minutes: 8,
    inputs:
      "Fictional chip excerpt: VDD 1.8–3.6 V; input must not exceed VDD+0.3 V; reset active-low for at least 10 microseconds; maximum SPI clock 2 MHz. Design: VDD 3.3 V, input 5 V, reset pulse 5 microseconds, SPI 4 MHz.",
    tasks: [
      "Compare each design value to the excerpt and list the violations. Hint: with VDD 3.3 V the input limit is 3.6 V.",
      "Independently propose corrected settings, a safe interface for the 5 V signal and tests for reset duration and bus frequency.",
      "A new revision changes reset minimum to 50 microseconds and SPI maximum to 1 MHz below 2.0 V. Write a configuration and validation plan covering both revisions and voltage ranges without guessing unspecified behavior.",
    ],
    checks: [
      "Interprets units, limits and revision conditions correctly",
      "Proposes corrections within the supplied specifications",
      "Identifies missing specifications and concrete validation checks",
    ],
  },
  "J.GIT": {
    minutes: 8,
    inputs:
      "Fictional repository: main has commits A→B; your feature branch A→C changes timeout=10 to timeout=20. B changes the same line to timeout=30 because a test needs at least 25. You have uncommitted notes.txt. No live repository is used.",
    tasks: [
      "With the hints status, save your work, fetch, compare and resolve, explain a safe next sequence. Which timeout preserves the stated test requirement?",
      "Write a safe independent integration sequence, explain the conflict decision and name tests and diff checks before opening a PR. Preserve notes.txt.",
      "Your branch is shared and a later commit accidentally includes a secret in history. Explain immediate containment and a coordinated history-remediation plan, distinguishing revocation from deleting the file and avoiding an unannounced force push.",
    ],
    checks: [
      "Preserves uncommitted/shared work and understands the branch history",
      "Resolves from the requirement and verifies the resulting diff",
      "Explains collaboration and recovery consequences of history changes",
    ],
  },
  "J.WEB_BACKEND": {
    minutes: 8,
    inputs:
      "Fictional POST /bookings accepts {slotId,seats}. A slot has capacity 2; the handler reads remaining seats, then inserts a booking. It accepts seats=-1 and does not check the caller. Two simultaneous requests can both read remaining=2.",
    tasks: [
      "Using validation → permission → capacity, identify three defects and sketch checks. Hint: seats must be a positive integer within the slot's limit.",
      "Design the request validation, permission check and atomic capacity update independently. Give expected status codes and a concurrent-request test.",
      "A client now retries after a timeout and payments are handled by another service. Design idempotency and failure recovery without claiming a local transaction can atomically commit the external payment.",
    ],
    checks: [
      "Validates input and caller permissions at the server boundary",
      "Prevents oversubscription with an atomic operation",
      "Explains retries, failure responses and meaningful integration tests",
    ],
  },
  "J.WEB_FRONTEND": {
    minutes: 8,
    inputs:
      "Fictional search UI calls fetch('/search?q='+text) on every keystroke and renders the last response to arrive. Request for 'ca' takes 800 ms; request for 'cat' takes 100 ms. The input has no visible label; errors disappear silently.",
    tasks: [
      "Using the two request times, explain which stale result may win. Suggest a visible label and an error message with a retry action. Hint: responses can arrive out of order.",
      "Write pseudocode or React for independent loading, empty, error and result states while ignoring stale responses. Include a keyboard/accessibility check.",
      "Add slow connections and rapid changes of search filters. Propose cancellation or request-version handling, preserve useful focus and describe tests that prove old results cannot overwrite the current query.",
    ],
    checks: [
      "Prevents stale asynchronous results replacing current state",
      "Provides explicit loading, empty and recoverable error states",
      "Preserves labelled controls, keyboard access and testable behavior",
    ],
  },
  "J.TESTING": {
    minutes: 8,
    inputs:
      "Fictional sensor function alarm(temp) returns temp > 18. Requirement: temperatures of 18 degrees or above trigger the alarm. Current test: alarm(25) is true. Invalid temperatures should be rejected, not silently coerced.",
    tasks: [
      "Using the boundary 18, add cases for 17,18,19 and identify the bug. Hint: 'at least' includes the boundary.",
      "Design a small independent test suite for the boundary, invalid inputs and a corrected implementation. Explain what each test protects.",
      "The function is now called through an API receiving JSON and a policy service that may time out. Separate unit, contract and integration checks, define failure behavior and avoid tests that merely repeat implementation details.",
    ],
    checks: [
      "Derives assertions from requirements and meaningful boundaries",
      "Covers invalid input and failure behavior",
      "Chooses tests that expose defects at the appropriate layer",
    ],
  },
  "J.SQL": {
    minutes: 8,
    inputs:
      "Fictional tables: teams(id,name): (1,Alpha),(2,Beta). tickets(id,team_id,status): (10,1,open),(11,1,closed),(12,1,open). Need one row per team with the count of open tickets, including zero for Beta.",
    tasks: [
      "Use LEFT JOIN and COUNT(ticket.id) as hints to write the query. Explain why filtering open tickets in WHERE could remove Beta.",
      "Write the query independently and the expected two rows. Explain null handling, duplicate-count risks and a test for a team with no tickets.",
      "Tickets now have many tag rows and the report must show open-ticket counts by team without duplication. Propose a query and indexes, and explain what an execution plan would need to establish before a performance claim.",
    ],
    checks: [
      "Returns all teams with correct zero and nonzero counts",
      "Handles joins, nulls and duplication intentionally",
      "Provides expected results and justified validation/performance checks",
    ],
  },
  "J.PYTHON": {
    minutes: 8,
    inputs:
      "Fictional CSV rows: device,temp = A,20; A,22; B,; B,error; B,18. Requirement: mean numeric temperature per device, report invalid rows separately; no third-party packages required.",
    tasks: [
      "Using a dictionary of sums/counts and try/except as hints, sketch the script and give A's expected mean. Do not treat invalid data as zero.",
      "Write an independent function or script, define treatment of blanks and invalid values, and give tests for empty input and a device with no valid measurements.",
      "The file now exceeds memory and may end with a partial row. Design streaming aggregation and an explicit error/reporting strategy that avoids silently publishing an incomplete result.",
    ],
    checks: [
      "Parses and aggregates valid values without treating missing data as zero",
      "Makes invalid/empty input behavior explicit",
      "Provides concrete expected outputs and resource/failure tests",
    ],
  },
  "J.DATA_ANALYSIS": {
    minutes: 8,
    inputs:
      "Fictional support data: week1 10 tickets, mean resolution 60 minutes; week2 100 tickets, mean resolution 20 minutes. Week2 excludes unresolved tickets. A slide says 'overall mean 40 minutes; service improved'.",
    tasks: [
      "With weighted mean = sum(count×mean)/sum(count) as a hint, check the overall mean for the reported resolved tickets and name the missing information.",
      "Independently critique the two claims, compute the weighted mean and propose checks for unresolved cases and changing ticket difficulty before inferring improvement.",
      "Week2 contains mostly easy automated tickets and logging changed midweek. Propose a comparison strategy, sensitivity checks and a cautious conclusion a service lead can act on.",
    ],
    checks: [
      "Uses appropriate aggregation and states the population measured",
      "Identifies missingness, selection and confounding",
      "Separates descriptive evidence from unsupported causal claims",
    ],
  },
  "J.ML": {
    minutes: 8,
    inputs:
      "Fictional equipment dataset: 1000 readings, 950 normal, 50 failures. A model always predicts normal and reports 95% accuracy. Readings from the same device appear in both train and test; maintenance outcome is included as an input after failure.",
    tasks: [
      "Using the class counts, explain why accuracy is misleading and calculate how many failures this model finds. Hint: consider recall for failures.",
      "Independently identify leakage, propose a device/time-aware split and evaluation metrics tied to missed failures and false alarms. No training code is required.",
      "A new device model shifts the data distribution and labels arrive a month late. Design monitoring, a safe fallback and a reevaluation plan, explaining what cannot be established from unlabelled data alone.",
    ],
    checks: [
      "Relates metrics to class imbalance and operational consequences",
      "Prevents target/device/time leakage",
      "States validation limits and a practical response to changing data",
    ],
  },
  "J.DASHBOARD": {
    minutes: 8,
    inputs:
      "Fictional event data: Alpha capacity=3, approved=2, unreviewed=4; Beta capacity=2, approved=2, unreviewed=0. A draft dashboard shows only approved totals and uses green/red without text labels.",
    tasks: [
      "With capacity, approved and remaining as hints, sketch a labelled view and calculate remaining places. Add a text indication so colour is not the only signal.",
      "Independently design a compact organiser view showing capacity, review workload, filter scope and an actionable next step. Explain the denominator of every displayed value.",
      "Decisions update concurrently and one source is delayed. Revise the view to show freshness, avoid implying a booking is confirmed and handle empty/error states without hiding unresolved people.",
    ],
    checks: [
      "Shows relevant values with correct scope and denominators",
      "Supports a concrete next action without relying on colour alone",
      "Makes missing, stale and failed data visible",
    ],
  },
  "J.TROUBLESHOOT": {
    minutes: 8,
    inputs:
      "Fictional user: sync stopped after changing a password. Log: 09:01 HTTP401; 09:02 retry401; other users sync normally. The status page reports no outage. Do not request or print credentials.",
    tasks: [
      "Follow scope → last change → error → safe next step. Suggest a question and a test. Hint: 401 concerns authentication, not proof of a server outage.",
      "Independently propose a diagnosis sequence, a safe recovery action and checks that confirm sync recovered without losing pending work.",
      "Reauthentication fixes desktop but mobile still fails intermittently on two networks. Revise hypotheses, isolate device/session effects and write an escalation containing evidence but no secrets.",
    ],
    checks: [
      "Uses scope, changes and logs to form testable hypotheses",
      "Protects credentials and pending user work",
      "Verifies recovery or escalates with reproducible evidence",
    ],
  },
  "J.LINUX": {
    minutes: 8,
    inputs:
      "Fictional service runs as appuser. Log: cannot write /var/lib/demo/state.json: Permission denied. Directory owner root:root, mode 0755. Disk usage 40%. No live commands will be executed.",
    tasks: [
      "Using ls -ld, id and service logs as hints, explain the permission failure and propose a narrowly scoped correction. Avoid chmod 777.",
      "Write an independent diagnosis and verification sequence, including ownership, service identity and a safe rollback if the change fails.",
      "The service now runs in a container with a read-only root filesystem and a mounted data volume. Explain which permission and mount evidence is needed, propose a least-privilege fix and distinguish host IDs from container IDs.",
    ],
    checks: [
      "Interprets service identity and filesystem permissions correctly",
      "Proposes a narrow reversible correction rather than broad privileges",
      "Verifies writes and considers the actual runtime/mount context",
    ],
  },
  "J.NETWORK": {
    minutes: 8,
    inputs:
      "Fictional laptop: IP 192.0.2.10/24, gateway192.0.2.1. Gateway ping succeeds; HTTPS to service IP succeeds; DNS lookup service.example fails. Another laptop using a different DNS resolver works. Documentation addresses only; no live tests needed.",
    tasks: [
      "Follow local link → route → DNS → service. Identify the likely failing layer and a next check. Hint: successful HTTPS by IP does not prove DNS works.",
      "Independently propose commands/checks and expected observations to distinguish resolver, local configuration and service failures. Avoid changing unrelated settings.",
      "Failure now occurs only over VPN and only for an internal hostname. Design a split-DNS/routing investigation, explain what each result would rule out and propose a reversible correction.",
    ],
    checks: [
      "Separates DNS, routing and application evidence",
      "Uses targeted tests with expected results",
      "Proposes a bounded reversible fix and validates recovery",
    ],
  },
  "J.CLOUD": {
    minutes: 8,
    inputs:
      "Fictional container service listens on 127.0.0.1:3000; platform routes to container port8080. Image includes a .env file. Health check GET /health returns200 before dependencies are ready. No real deployment is required.",
    tasks: [
      "Using listen address, port and secrets as a checklist, identify defects and propose safe corrections. Hint: runtime secrets should not be baked into the image.",
      "Independently sketch a deployment pipeline with runtime secrets, readiness checks, logs and a rollback test. Explain how traffic reaches the process.",
      "A new version changes stored data and fails after half the replicas update. Propose a compatible migration and recovery sequence, distinguishing code rollback from irreversible data changes.",
    ],
    checks: [
      "Configures reachable ports and separates secrets from images",
      "Includes readiness, observability and a testable deployment path",
      "Handles partial failure and data compatibility explicitly",
    ],
  },
  "J.TICKETING": {
    minutes: 8,
    inputs:
      "Fictional queue: T1 one user cannot export, workaround available; T2 all users cannot sign in, no workaround; T3 asks where to find a guide. Knowledge base: export workaround is CSV; guide is /help/start. Never request passwords.",
    tasks: [
      "With impact and workaround as hints, order the tickets and draft a useful reply for T1 citing the workaround.",
      "Independently prioritise, draft a T2 update with a next-update time, and write a knowledge-base note for T1 without claiming a permanent fix.",
      "T2 repeats weekly and the queue doubles. Propose categories, escalation triggers and an evidence-based process change; distinguish response speed from actually resolving the user's problem.",
    ],
    checks: [
      "Prioritises using impact and available workarounds",
      "Communicates an honest next action and follow-up",
      "Documents reusable fixes and a clear escalation path",
    ],
  },
  "J.DATA_PIPELINES": {
    minutes: 8,
    inputs:
      "Fictional CSV source: id,updated_at,value = 1,10:00,20; 2,10:01,30; 2,10:01,30. A job appends all rows to a target table each run. Required fields are id and value. Network failure may happen after the write but before acknowledgement.",
    tasks: [
      "Using row counts and unique IDs as hints, explain what happens on two runs and propose a duplicate check and a missing-field check.",
      "Independently design a repeatable import with validation, an idempotent write and a useful error report. Give a retry test after a lost acknowledgement.",
      "The source changes value to reading and sends late updates out of order. Propose schema-version handling, update ordering and reconciliation so downstream users can detect missing or stale data.",
    ],
    checks: [
      "Validates required fields and identifies duplicate/missing records",
      "Makes retries repeatable without duplicating writes",
      "Explains ordering/schema changes and reconciliation evidence",
    ],
  },
};
