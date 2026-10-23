# Engineering Standard — aether-ai-evaluations

- Pin dataset, rubric, runner, agent/model, and dependency versions for each run.
- Separate deterministic assertions from probabilistic scores.
- Use stable metric names and documented score direction/range.
- Fail closed when dataset validation or isolation setup fails.
- Make runs reproducible where model/provider capabilities permit; record limits where they do not.
- Keep synthetic fixtures small, deterministic, and license-cleared.
- Never claim a release gate passed without recorded run evidence.
