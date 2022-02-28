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
        <textarea value={text} onChange={handleChange}></textarea>
      </div>

      <div class="boxes">
        <div class="box clock">
          <Clock />
          <a href="#slideout" data-slideout-toggle>settings</a>
        </div>
        <div class="box timers">
          <TimerComponent timers={timers} />
        </div>
      </div>
    </>
  );
}

function Clock() {
  const [now, setNow] = useState(Temporal.Now.plainTimeISO());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Temporal.Now.plainTimeISO());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <>
      {hourMin(now, true)}
    </>
  );
}
function TimerComponent({ timers }: { timers: Timer[] }) {
  return (
    <>
      {timers.map(({ at, text }) => {
        return <p>{hourMin(at)} {text}</p>;
      })}
    </>
  );
}

export const config: PageConfig = { runtimeJS: true };
