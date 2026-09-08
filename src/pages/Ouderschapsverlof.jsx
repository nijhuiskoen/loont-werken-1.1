import React from "react";
import ComingSoon from "../components/ComingSoon.jsx";
import { CALCULATORS } from "../config/calculators.js";

/* Nog te bouwen. De page bestaat al zodat de route en registry compleet zijn. */
export default function Ouderschapsverlof(){
  const calculator = CALCULATORS.find((c)=>c.module === "Ouderschapsverlof");
  return <ComingSoon calculator={calculator} />;
}
