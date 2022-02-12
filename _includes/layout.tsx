import { React } from "lume/deps/react.ts";

const render: React.FC<{ title: string }> = ({ title, children }) => (
  <html>
    <head>
      <title>{title}</title>
    </head>
    <body>
      {children}
    </body>
  </html>
);
export default render;
