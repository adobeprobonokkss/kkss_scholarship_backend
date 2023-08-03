// import pino from "pino";
// import dayjs from "dayjs";
// const logger = require("pino")();

// // const log = pino({
// //   prettyPrint: true,
// //   base: {
// //     pid: false
// //   },
// //   timestamp: () => ` "time" :"${dayjs().format()}"`
// // });

export const logger = (...args: String[]) => {
  console.log(args);
};
