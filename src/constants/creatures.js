export const CREATURES = [
  { id: 'puppy',  emoji: '🐶', name: 'Puppy'  },
  { id: 'kitty',  emoji: '🐱', name: 'Kitty'  },
  { id: 'angel',  emoji: '👼', name: 'Angel'  },
  { id: 'dragon', emoji: '🐲', name: 'Dragon' },
  { id: 'bunny',  emoji: '🐰', name: 'Bunny'  },
  { id: 'fox',    emoji: '🦊', name: 'Fox'    },
]

// Personality greetings per creature per time of day
export const CREATURE_GREETINGS = {
  puppy: {
    morning: [
      name => `${name} woke up wagging! Ready for today? 🐾`,
      name => `${name} is bouncing around — morning time!`,
      name => `Good morning! ${name} fetched your to-do list.`,
    ],
    midday: [
      name => `${name} is checking in on you this afternoon.`,
      name => `Afternoon belly rubs? ${name} thinks you deserve them.`,
      name => `${name} wants to know how you're doing!`,
    ],
    evening: [
      name => `${name} is curling up for the evening with you.`,
      name => `End of day! ${name} is proud of you.`,
      name => `${name} nuzzled up close. Time to wind down.`,
    ],
  },
  kitty: {
    morning: [
      name => `${name} stretched and yawned. New day!`,
      name => `${name} knocked something off the counter to wake you up.`,
      name => `Good morning! ${name} has been waiting for you.`,
    ],
    midday: [
      name => `${name} found a sunny spot and saved you one too.`,
      name => `Afternoon check-in! ${name} is purring.`,
      name => `${name} is watching you with proud cat eyes.`,
    ],
    evening: [
      name => `${name} is kneading the blankets. Time to rest.`,
      name => `${name} curled up in your lap for the evening.`,
      name => `Purr... ${name} says it's time to wind down.`,
    ],
  },
  angel: {
    morning: [
      name => `${name} is glowing softly this morning. 🌟`,
      name => `A new day, a new start. ${name} believes in you.`,
      name => `${name} is here to walk with you today.`,
    ],
    midday: [
      name => `${name} is watching over your afternoon.`,
      name => `Halfway through! ${name} sends gentle light.`,
      name => `${name} wants you to know: you're doing great.`,
    ],
    evening: [
      name => `${name} wraps you in warm light as the day ends.`,
      name => `${name} is here for the evening. Rest well.`,
      name => `The stars are out, and ${name} is with you.`,
    ],
  },
  dragon: {
    morning: [
      name => `${name} breathes warm fire to start the day! 🔥`,
      name => `Rise and shine! ${name} is ready for anything.`,
      name => `${name} roars gently. Time to be brave.`,
    ],
    midday: [
      name => `${name} is guarding your afternoon.`,
      name => `Afternoon update! ${name} flexes a wing at you.`,
      name => `${name} says: you're stronger than you know.`,
    ],
    evening: [
      name => `${name} curls around you for the evening. Safe.`,
      name => `${name} breathes softly. Time to rest, warrior.`,
      name => `Dragons rest too. ${name} is winding down with you.`,
    ],
  },
  bunny: {
    morning: [
      name => `${name} hopped over to say good morning! 🐾`,
      name => `Nose wiggle! ${name} is happy to see you.`,
      name => `${name} found some morning sunshine for you.`,
    ],
    midday: [
      name => `${name} is nibbling a snack and thinking of you.`,
      name => `Afternoon hop! ${name} wants to check in.`,
      name => `${name} twitched their ears at you. Hi!`,
    ],
    evening: [
      name => `${name} is making a cozy nest for the evening.`,
      name => `${name} snuggled in. Time for quiet time.`,
      name => `Soft bunny vibes. ${name} is here with you.`,
    ],
  },
  fox: {
    morning: [
      name => `${name} has some clever ideas for today! 🦊`,
      name => `Good morning! ${name} is sharp and ready.`,
      name => `${name} scouted ahead. Today looks good.`,
    ],
    midday: [
      name => `${name} is keeping an eye on your afternoon.`,
      name => `Clever fox check-in! How's it going?`,
      name => `${name} found something interesting today.`,
    ],
    evening: [
      name => `${name} is settling into their den for the night.`,
      name => `${name} says: good foxes rest after busy days.`,
      name => `Evening time. ${name} curls their tail around you.`,
    ],
  },
}
