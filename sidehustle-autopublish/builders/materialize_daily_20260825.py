from pathlib import Path
base=Path(__file__).parent
parts=[base/f"_daily_20260825_part{i}.txt" for i in range(1,5)]
code="".join(p.read_text("utf-8") for p in parts)
compile(code,str(__file__) + "::assembled","exec")
exec(code,globals(),globals())
