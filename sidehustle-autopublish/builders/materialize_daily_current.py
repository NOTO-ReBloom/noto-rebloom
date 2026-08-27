from pathlib import Path
import json

base = Path(__file__).parent
plan_path = base / "daily_plan_current.json"
if not plan_path.exists():
    raise FileNotFoundError(f"missing canonical current plan: {plan_path}")

plan = json.loads(plan_path.read_text("utf-8"))
plan_date = plan.get("date")
if not plan_date:
    raise ValueError("daily_plan_current.json must contain date")

# Legacy builder parts are retained only as the implementation body. Runtime date and
# plan selection come from daily_plan_current.json; never pin a historical daily plan.
parts = [base / f"_daily_20260825_part{i}.txt" for i in range(1, 5)]
missing = [str(p) for p in parts if not p.exists()]
if missing:
    raise FileNotFoundError(f"missing legacy builder parts: {missing}")
code = "".join(p.read_text("utf-8") for p in parts)
code = code.replace("requiredRe\naderChecks", "requiredReaderChecks")
code = code.replace("ensure_\nascii", "ensure_ascii")
code = code.replace("daily_plan_20260825.json", "daily_plan_current.json")
code = code.replace('"previousDate":"2026-08-24"', '"previousDate":PLAN.get("previousDate")')
compile(code, str(__file__) + "::assembled-current", "exec")
exec(code, globals(), globals())
