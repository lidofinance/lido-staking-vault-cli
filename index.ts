#! /usr/bin/env node

import { program } from "./command";
import "./programs";

program.parse(process.argv);
