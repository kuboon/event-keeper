/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import { React } from "lume/deps/react.ts";
const {
  Fragment,
  useEffect,
  useState,
} = React;

const startAt = new Date();
type Timer = {
  at: Date;
  text: string;
};
function parse(str: string): Timer[] {
  const lines = str.split("\n");

  return [{at: startAt, text: "Started"},{at: new Date(startAt.getTime()+30000), text: "Ended"}];
}
export default function Home() {
  const [text, setText] = useState("");
  const [timers, setTimers] = useState<Timer[]>([]);
  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const target = e.target
    setText(target.value);
    setTimers(parse(target.value));
  };
  return (
    <>
      <title>Event Keeper</title>
      <div className="input">
        <textarea value={text} onChange={handleChange}></textarea>
      </div>
      <div className="timer">
        <TimerComponent timers={timers} />
      </div>
    </>
  );
}

function TimerComponent({ timers }: { timers: Timer[] }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  let from: Date | undefined;
  return (
    <>
      {timers.map(({ at, text }) => {
        const showNow = from && from < now && now < at
          ? <p className="now">{now}</p>
          : "";
        from = at;
        return (
          <>
            {showNow}
            <p>{at} {text}</p>
          </>
        );
      })}
    </>
  );
}
