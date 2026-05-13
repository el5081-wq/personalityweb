const questions = [
  {
    id: 1,
    text: "Your ideal Friday night is...",
    options: [
      { id: "a", text: "Hosting a party or going out with a big group", scores: { CONNECTOR: 3, LEADER: 1 } },
      { id: "b", text: "Solo hike, drive, or outdoor adventure", scores: { EXPLORER: 3, ANALYST: 1 } },
      { id: "c", text: "Deep dive into a creative project", scores: { CREATOR: 3, VISIONARY: 1 } },
      { id: "d", text: "Planning and mapping out your next big goal", scores: { ACHIEVER: 3, LEADER: 1 } },
    ],
  },
  {
    id: 2,
    text: "When you face a tough problem, you...",
    options: [
      { id: "a", text: "Break it into logical steps and research the data", scores: { ANALYST: 3, ACHIEVER: 1 } },
      { id: "b", text: "Trust your gut and act fast", scores: { LEADER: 3, EXPLORER: 1 } },
      { id: "c", text: "Talk it through with people you trust", scores: { CONNECTOR: 3, PROTECTOR: 1 } },
      { id: "d", text: "Find a creative, unconventional solution", scores: { VISIONARY: 3, CREATOR: 1 } },
    ],
  },
  {
    id: 3,
    text: "People who know you best would say you are...",
    options: [
      { id: "a", text: "The one who always has a plan", scores: { ACHIEVER: 3, ANALYST: 1 } },
      { id: "b", text: "The life of the party", scores: { CONNECTOR: 3, LEADER: 1 } },
      { id: "c", text: "Full of wild, exciting ideas", scores: { VISIONARY: 3, CREATOR: 1 } },
      { id: "d", text: "Steady, calm, and dependable", scores: { PROTECTOR: 3, ANALYST: 1 } },
    ],
  },
  {
    id: 4,
    text: "Your dream job would involve...",
    options: [
      { id: "a", text: "Leading a team toward a massive mission", scores: { LEADER: 3, ACHIEVER: 1 } },
      { id: "b", text: "Exploring new places, ideas, or industries constantly", scores: { EXPLORER: 3, VISIONARY: 1 } },
      { id: "c", text: "Creating art, music, writing, or design", scores: { CREATOR: 3, VISIONARY: 1 } },
      { id: "d", text: "Directly helping and supporting other people", scores: { PROTECTOR: 3, CONNECTOR: 1 } },
    ],
  },
  {
    id: 5,
    text: "In a group project, you naturally become...",
    options: [
      { id: "a", text: "The organizer who delegates tasks", scores: { LEADER: 3, ACHIEVER: 1 } },
      { id: "b", text: "The creative brainstormer with big ideas", scores: { VISIONARY: 3, CREATOR: 1 } },
      { id: "c", text: "The researcher who digs into the details", scores: { ANALYST: 3, ACHIEVER: 1 } },
      { id: "d", text: "The peacemaker who keeps everyone happy", scores: { CONNECTOR: 3, PROTECTOR: 1 } },
    ],
  },
  {
    id: 6,
    text: "When making a big decision, you rely most on...",
    options: [
      { id: "a", text: "Hard facts, data, and research", scores: { ANALYST: 3, ACHIEVER: 1 } },
      { id: "b", text: "What feels right in your heart", scores: { CONNECTOR: 2, PROTECTOR: 2 } },
      { id: "c", text: "What excites and energizes you most", scores: { EXPLORER: 2, VISIONARY: 2 } },
      { id: "d", text: "The long-term impact and outcome", scores: { LEADER: 2, ACHIEVER: 2 } },
    ],
  },
  {
    id: 7,
    text: "Your perfect vacation looks like...",
    options: [
      { id: "a", text: "Backpacking somewhere completely off the beaten path", scores: { EXPLORER: 3, VISIONARY: 1 } },
      { id: "b", text: "All-inclusive resort with friends or family", scores: { CONNECTOR: 3, PROTECTOR: 1 } },
      { id: "c", text: "City trip packed with museums, galleries, and culture", scores: { ANALYST: 2, CREATOR: 2 } },
      { id: "d", text: "Productivity retreat to grind on your biggest goals", scores: { ACHIEVER: 3, LEADER: 1 } },
    ],
  },
  {
    id: 8,
    text: "What do you value most in life?",
    options: [
      { id: "a", text: "Freedom and new experiences", scores: { EXPLORER: 3, VISIONARY: 1 } },
      { id: "b", text: "Success and achievement", scores: { ACHIEVER: 3, LEADER: 1 } },
      { id: "c", text: "Deep relationships and belonging", scores: { CONNECTOR: 3, PROTECTOR: 1 } },
      { id: "d", text: "Knowledge and understanding the world", scores: { ANALYST: 3, CREATOR: 1 } },
    ],
  },
  {
    id: 9,
    text: "When something goes wrong, you...",
    options: [
      { id: "a", text: "Stay calm and fix it methodically", scores: { ANALYST: 3, PROTECTOR: 1 } },
      { id: "b", text: "Adapt quickly and pivot without overthinking", scores: { EXPLORER: 2, LEADER: 2 } },
      { id: "c", text: "Lean on others for support and talk it out", scores: { CONNECTOR: 3, PROTECTOR: 1 } },
      { id: "d", text: "Turn it into a lesson or a story to tell", scores: { VISIONARY: 2, CREATOR: 2 } },
    ],
  },
  {
    id: 10,
    text: "The compliment that means the most to you is...",
    options: [
      { id: "a", text: "\"You're incredibly creative\"", scores: { CREATOR: 3, VISIONARY: 1 } },
      { id: "b", text: "\"You're so dependable and caring\"", scores: { PROTECTOR: 3, CONNECTOR: 1 } },
      { id: "c", text: "\"You're a natural leader\"", scores: { LEADER: 3, ACHIEVER: 1 } },
      { id: "d", text: "\"You always push boundaries\"", scores: { EXPLORER: 3, ACHIEVER: 1 } },
    ],
  },
];

module.exports = questions;
