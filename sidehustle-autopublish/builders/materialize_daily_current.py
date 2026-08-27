from pathlib import Path

base = Path(__file__).parent
parts = [base / f"_daily_20260825_part{i}.txt" for i in range(1, 5)]
code = "".join(p.read_text("utf-8") for p in parts)
code = code.replace("requiredRe\naderChecks", "requiredReaderChecks")
code = code.replace("ensure_\nascii", "ensure_ascii")
code = code.replace('daily_plan_20260825.json', 'daily_plan_20260827.json')
code = code.replace('"previousDate":"2026-08-24"', '"previousDate":PLAN.get("previousDate")')
compile(code, str(__file__) + "::assembled-current", "exec")
exec(code, globals(), globals())
