/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />
/** @jsxFrag Fragment */
/** @jsx h */

import {
  h,
  Fragment,
  useState,
  setState
} from './deps/nano.ts';

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
  const [text, setText] = useState("", 'text');
  const [timers, setTimers] = useState<Timer[]>([], 'timer');
  const handleChange = (e: Event) => {
    const target = e.target! as HTMLTextAreaElement;
    setText(target.value);
    setTimers(parse(target.value));
  };
  return (
    <>
      <title>Event Keeper</title>
      <div class="input">
        <textarea value={text} onChange={handleChange}></textarea>
      </div>
      <div class="timer">
        <TimerComponent timers={timers} />
      </div>
    </>
  );
}

function TimerComponent({ timers }: { timers: Timer[] }) {
  const [now, setNow] = useState(new Date(), 'now');
  setTimeout(() => {
      //setNow(new Date());
    }, 1000);
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
