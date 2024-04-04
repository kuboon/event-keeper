import { Head } from "$fresh/runtime.ts";
import App from "../islands/App.tsx";

export default function Home() {
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
      <App />
    </>
  );
}
