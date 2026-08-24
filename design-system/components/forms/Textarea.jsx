import React from "react";
import { inputBaseStyle } from "./Input.jsx";
export function Textarea(props) { return <textarea style={{ ...inputBaseStyle, minHeight: 96, resize: "vertical" }} {...props} />; }
