export const feedPosts = [
  {
    id: "p1",
    author: {
      name: "Ari Kim",
      handle: "arikim",
      avatar: "AK",
    },
    timestamp: "3h",
    text: "Shipped the first pass of our feed engine. Dark mode and thread rendering feel crisp on 1440p.",
    likes: 12,
    replies: 8,
    comments: [
      {
        id: "c1",
        author: { name: "Mina Rao", handle: "minarao", avatar: "MR" },
        timestamp: "2h",
        text: "The hierarchy reads clean. Try giving nested levels a touch more left offset for scanability.",
        children: [
          {
            id: "c1-1",
            author: { name: "Ari Kim", handle: "arikim", avatar: "AK" },
            timestamp: "2h",
            text: "Good call. I increased spacing at depth two and above.",
            children: [],
          },
          {
            id: "c1-2",
            author: { name: "Luca V", handle: "lucav", avatar: "LV" },
            timestamp: "1h",
            text: "It now feels close to Reddit threading while staying X minimal.",
            children: [
              {
                id: "c1-2-1",
                author: { name: "Mina Rao", handle: "minarao", avatar: "MR" },
                timestamp: "56m",
                text: "Exactly the blend I was hoping for.",
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: "c2",
        author: { name: "Noah Reed", handle: "nreed", avatar: "NR" },
        timestamp: "1h",
        text: "Performance is solid. 60fps while expanding deep comment branches.",
        children: [],
      },
    ],
  },
  {
    id: "p2",
    author: {
      name: "Sofia West",
      handle: "sofiaw",
      avatar: "SW",
    },
    timestamp: "5h",
    text: "A minimalist interface can still feel expressive if motion is restrained and intentional.",
    likes: 29,
    replies: 5,
    comments: [
      {
        id: "c3",
        author: { name: "Nate Bell", handle: "nateb", avatar: "NB" },
        timestamp: "4h",
        text: "The micro-interactions are doing heavy lifting here.",
        children: [
          {
            id: "c3-1",
            author: { name: "Sofia West", handle: "sofiaw", avatar: "SW" },
            timestamp: "3h",
            text: "Agreed. Even subtle hover states improve confidence.",
            children: [],
          },
        ],
      },
    ],
  },
];
