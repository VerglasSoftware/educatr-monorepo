import "./Play.css";
import {Helmet} from "react-helmet";

export default function PlayHome() {
  return (
    <div className="Home">
        <Helmet>
            <title>Play</title>
        </Helmet>
      <div className="lander">
        <h1>Educatr</h1>
        <p className="text-muted">Hello, world!</p>
      </div>
    </div>
  );
}
