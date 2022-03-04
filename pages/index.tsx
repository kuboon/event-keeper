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
        <meta name="viewport" content="user-scalable=no"></meta>
        <link href="/style.css" rel="stylesheet" />
      </Head>
      <div id="slideout" data-slideout-panel>
        <div data-slideout-header>
          <h3>setting</h3>
          <a href="#" data-slideout-close>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-x"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
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

      <a class="button" href="#slideout" data-slideout-toggle>&gt;</a>
      {showClock && <ClockPart timers={timers}/>}
    </>
  );
}
function ClockPart({ timers }: { timers: Timer[] }) {
  const now = useTimer();
  return      <div class="boxes">
        <div class="box clock">
          <Clock now={now} />
        </div>
        <div class="box timers">
          <TimerComponent timers={timers} now={now} />
        </div>
      </div>
}
function useTimer() {
  const [now, setNow] = useState(Temporal.Now.plainTimeISO());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Temporal.Now.plainTimeISO());
    }, 1000);
    console.log('timer', timer);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return now;
}
function Clock({ now }: { now: Temporal.PlainTime }) {
  return (
    <p id="now">
      <svg version="1.2" viewBox="0 0 40 40" style="width: 100%" xmlns="http://www.w3.org/2000/svg" >
        <text id="t1" y="20" >{hourMin(now, true)}</text>
      </svg>
    </p>
  );
}
function TimerComponent(
  { timers, now }: { timers: Timer[]; now: Temporal.PlainTime },
) {
  const ret: h.JSX.Element[] = [];
  for (let i = 0; i < timers.length; i++) {
    const { at, text } = timers[i];
    const { at: next } = timers[i + 1] || {};
    const showLine = next &&
      Temporal.PlainTime.compare(at, now) < 0 &&
      Temporal.PlainTime.compare(now, next) < 0;
    ret.push(<p class={showLine ? "line" : ""}>{hourMin(at)} {text}</p>);
  }
  return <>{ret}</>;
}

export const config: PageConfig = { runtimeJS: true };
