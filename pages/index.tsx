/** @jsx h */
/** @jsxFrag Fragment */
import {
  Fragment,
  h,
  Head,
  PageConfig,
  Temporal,
  useEffect,
  useState,
} from "../deps.ts";

type Timer = {
  at: Temporal.PlainTime;
  text: string;
};
function hourMin(time: Temporal.PlainTime, showSec = false) {
  const hour = time.hour.toString().padStart(2, "0");
  const min = time.minute.toString().padStart(2, "0");
  const sec = time.second.toString().padStart(2, "0");
  return showSec ? `${hour}:${min}:${sec}` : `${hour}:${min}`;
}
function parse(str: string): Timer[] {
  let absolute = true;
  const ret: Timer[] = [];
  let time = Temporal.Now.plainTimeISO();
  for (const line of str.split("\n")) {
    if (line === "") {
      absolute = true;
      continue;
    }
    const [time_, text] = line.split(" ");
    if (absolute) {
      absolute = false;
      time = Temporal.PlainTime.from(time_);
    } else {
      const [hours, minutes] = time_.split(":").map((x) => parseInt(x));
      const duration = Temporal.Duration.from({ hours, minutes });
      time = time.add(duration);
    }
    ret.push({ at: time, text });
  }

  return ret;
}
const startAt = Temporal.Now.plainTimeISO();
const time2 = startAt.add({ minutes: 5 });
const defaultText = `${hourMin(startAt)} 開始
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:01 １分後
0:02 その2分後

${hourMin(time2)} 空行のあとは時刻
0:05 その5分後

`;
export default function Home() {
  const [text, setText] = useState(defaultText);
  const [timers, setTimers] = useState<Timer[]>(parse(text));
  const [showClock, setShowClock] = useState(true);
  const handleChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setText(target.value);
    setTimers(parse(target.value));
  };
  return (
    <>
      <Head>
        <title>Event Keeper</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,user-scalable=no"
        >
        </meta>
        <link href="/style.css" rel="stylesheet" />
      </Head>
      <div id="slideout" data-slideout-panel>
        <div data-slideout-header>
          <h3>setting</h3>
          <a href="#" data-slideout-close>
            x
          </a>
        </div>
        <textarea
          value={text}
          onChange={handleChange}
          onFocus={() => setShowClock(false)}
          onBlur={() => setShowClock(true)}
        >
        </textarea>
      </div>

      {showClock && <ClockPart timers={timers} />}
    </>
  );
}
function ClockPart({ timers }: { timers: Timer[] }) {
  const now = useTimer();
  let line = 0;
  for (let i = 0; i < timers.length; i++) {
    const { at } = timers[i];
    const { at: next } = timers[i + 1] || {};
    if (
      next &&
      Temporal.PlainTime.compare(at, now) < 0 &&
      Temporal.PlainTime.compare(now, next) < 0
    ) {
      line = i;
    }
  }
  return (
    <div class="boxes">
      <div class="box clock">
        <a id="slideout-button" href="#slideout" data-slideout-toggle>
          setting&gt;
        </a>
        <Clock now={now} />
      </div>
      <div class="box timers">
        <TimerComponent timers={timers} line={line} />
      </div>
    </div>
  );
}
function useTimer() {
  const [now, setNow] = useState(Temporal.Now.plainTimeISO());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Temporal.Now.plainTimeISO());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return now;
}
function Clock({ now }: { now: Temporal.PlainTime }) {
  return (
    <p id="now">
      <svg
        version="1.2"
        viewBox="0 0 40 20"
        style="width: 100%; height: 50%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <text id="t1" y="10">{hourMin(now, true)}</text>
      </svg>
    </p>
  );
}

let lastLine = -1;
function TimerComponent(
  { timers, line }: { timers: Timer[]; line: number },
) {
  const ret: h.JSX.Element[] = [];
  if (lastLine != line && window.document) {
    document.getElementById("line")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  lastLine = line;
  return (
    <>
      {timers.map(({ at, text }, i) => (
        <p
          id={i == line ? "line" : undefined}
        >
          {hourMin(at)} {text}
        </p>
      ))}
    </>
  );
}

export const config: PageConfig = { runtimeJS: true };
