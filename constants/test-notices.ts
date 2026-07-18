export type Notice = {
  author: string;
  date: string;
  detailParagraphs: string[];
  id: string;
  preview: string;
  teamName: string;
  time: string;
  title: string;
};

// Temporary transportation notices for testing the collapsed and expanded UI.
export const TEST_NOTICES: Notice[] = [
  {
    author: "@KORAIL",
    date: "2026.8.7",
    detailParagraphs: [
      "The 11:36 Gyeongui–Jungang Line service toward Deokso is delayed by approximately 25 minutes due to a signal inspection near Digital Media City Station.",
      "Passengers should check the station display before boarding. Trains may remain crowded while the timetable returns to normal. We are working to restore service as quickly as possible. ",
      "Please consider using an alternative route, such as A'REX or Line 6, to reach your destination. ",
      "We apologize for the inconvenience.",
    ],
    id: "gyeongui-jungang-delay",
    preview:
      "The 11:36 Gyeongui–Jungang Line service toward Deokso is delayed by 25 minutes.",
    teamName: "KORAIL Updates",
    time: "11:30",
    title: "Gyeongui–Jungang Line Delayed",
  },
  {
    author: "@SeoulMetro",
    date: "2026.8.7",
    detailParagraphs: [
      "Line 1 trains toward Incheon are experiencing delays of 15 to 20 minutes following a train inspection at Seoul Station.",
      "Platforms may be more crowded than usual. Please allow extra travel time and follow station staff instructions.",
    ],
    id: "line-1-seoul-delay",
    preview:
      "Line 1 trains toward Incheon are delayed by up to 20 minutes at Seoul Station.",
    teamName: "KORAIL Updates",
    time: "11:42",
    title: "Line 1 Service Delayed",
  },
  {
    author: "@KORAIL",
    date: "2026.8.7",
    detailParagraphs: [
      "The 12:05 Line 1 express service originally bound for Incheon will terminate at Guro Station because of an operational issue.",
      "Passengers travelling beyond Guro should transfer to a local train toward Incheon. Please check the platform display before transferring.",
    ],
    id: "incheon-express-short-service",
    preview:
      "The Incheon-bound express will terminate early at Guro Station.",
    teamName: "KORAIL Updates",
    time: "11:55",
    title: "Service Ending Early",
  },
  {
    author: "@SeoulMetro",
    date: "2026.8.7",
    detailParagraphs: [
      "The 12:32 Line 1 express service from Yongsan to Incheon has been cancelled due to a vehicle fault.",
      "Please use the next local service or check station displays for the following express train.",
    ],
    id: "line-1-express-cancelled",
    preview:
      "The 12:32 Line 1 express service from Yongsan to Incheon has been cancelled.",
    teamName: "Metro Updates",
    time: "12:01",
    title: "Line 1 Express Cancelled",
  },
  {
    author: "@KORAIL",
    date: "2026.8.7",
    detailParagraphs: [
      "Wangsimni Station is temporarily closed while platform equipment is inspected. All Gyeongui–Jungang Line trains will pass through without stopping.",
      "Passengers should transfer at Yongsan or use Seoul Subway Line 2 to reach the Wangsimni area. The station will reopen after the inspection.",
    ],
    id: "wangsimni-station-closed",
    preview:
      "Wangsimni Station is closed. All trains will pass through without stopping.",
    teamName: "KORAIL Updates",
    time: "12:10",
    title: "Wangsimni Station is Closed",
  },
  {
    author: "@KORAIL",
    date: "2026.8.7",
    detailParagraphs: [
      "The 12:24 Line 1 service toward Byeongjeom is delayed by approximately 10 minutes due to congestion near Yongsan Station.",
      "Please allow extra travel time. The train may wait briefly at intermediate stations while traffic clears.",
    ],
    id: "byeongjeom-service-delay",
    preview:
      "The 12:24 Line 1 service toward Byeongjeom is delayed by 10 minutes.",
    teamName: "KORAIL Updates",
    time: "12:16",
    title: "Byeongjeom Service Delayed",
  },
  {
    author: "@KORAIL",
    date: "2026.8.7",
    detailParagraphs: [
      "Gyeongui–Jungang Line trains between Hongik University and Munsan are operating at approximately 30-minute intervals.",
      "Longer waiting times and crowded platforms are expected. Consider using an alternative route where possible.",
    ],
    id: "gyeongui-reduced-frequency",
    preview:
      "Trains between Hongik University and Munsan are running every 30 minutes.",
    teamName: "KORAIL Updates",
    time: "12:22",
    title: "Reduced Train Frequency",
  },
  {
    author: "@StationTeam",
    date: "2026.8.7",
    detailParagraphs: [
      "The 12:40 Line 1 train toward Incheon will now depart from Platform 4 at Seoul Station instead of Platform 2.",
      "Please follow the station signs and allow additional time to reach the new platform.",
    ],
    id: "seoul-platform-change",
    preview:
      "The 12:40 Incheon-bound train at Seoul Station will depart from Platform 4.",
    teamName: "Station Team",
    time: "12:28",
    title: "Platform Changed",
  },
];
