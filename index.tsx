export const title = "Top";
export const layout = "layout.tsx";

import { React } from "lume/deps/react.ts";
const { useState, useEffect } = React;

const render: React.FC<{ title: string }> = ({ title }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(count + 1);
  }, [count]);
  return (
    <>
      <h1>{title}</h1>
      <p>{count}</p>
    </>
  );
};
export default render;
