import { Route, Routes } from "react-router";
import Home from "./Home";
import Recent from "./Recent/Recent";
import Trip from "./Recent/Trip";

export default function Routing() {
  return (
    <>
      <Routes>
        <Route index element={<Recent />} />
        <Route path="trip/:id" element={<Trip />} />
      </Routes>
    </>
  );
}
