#! /usr/bin/env node

import { program } from "./command/index.js";
import "./programs/index.js";

program.parse(process.argv);
