// Number of frames expected in each animation sequence.
export const HEADER_FRAMES = 46;
export const MOON_FRAMES = 148;

// Canvas render scale multipliers to control perceived zoom level.
export const HEADER_IMAGE_RENDER_SCALE = 4.0;
export const MOON_IMAGE_RENDER_SCALE = 3.0;

// Delay controls for text and labels relative to frame indices.
export const TEXT_OVERLAY_DELAY_FRAMES = 16;
export const LANDING_LABEL_DELAY_FRAMES = 16;
export const TEXT_FRAME_MATCH_WINDOW = 4;

// Scroll timing and visibility breakpoints.
export const HEADER_FRAME_PROGRESS_DISTANCE = 5000;
export const HERO_FADE_START = 890;
export const HERO_FADE_END = 2352;
export const HEADER_CANVAS_HIDE_SCROLL = 2560;
export const MOON_FADE_START = 2352;
export const MOON_FADE_END = 2976;

// Informational moon story cards keyed by frame numbers.
export const MOON_TEXTS = [
  { frame: 5, text: "After burning 348 tonnes of fuel, enduring over 40 days of radiation strikes, and traveling around 4 lakh kilometers in the vacuum of space, Chandrayaan-3 is on the verge of creating history. The spacecraft has reached its destination after completing some of the most challenging tasks in front of it, which included raising its orbit at Earth five times, covering the vast stretch between Earth and the Moon, and then critically lowering its altitude above the Moon." },
  { frame: 14, text: "It now flies nearly 100 kilometers above the lunar surface. The journey begins." },
  { frame: 16, text: "Vikram, Chandrayaan-3's lander, is a crucial component equipped with four throttle-able engines, enhancing its landing precision. The lander is designed with a Laser Doppler Velocimeter (LDV) and various subsystems like navigation sensors and propulsion systems to ensure a safe and soft landing on the Moon. With advanced hazard-detection cameras, stronger landing legs, and the ability to withstand a faster landing, it is ready for touchdown." },
  { frame: 20, caps: true, delayFrames: 0, text: "Separation Confirmed" },
  { frame: 24, text: "The propulsion module plays a crucial role in the spacecraft's journey. It carried the lander and rover configuration until the spacecraft reached a 100 km lunar orbit. The module functions like a communication relay satellite, ensuring smooth transmission of information. It was also responsible for raising the spacecraft's orbit several times before transferring it into the lunar orbit and subsequently lowering it until it reached a circular, 100-kilometer orbit. The module also houses the Spectro-polarimetry of Habitable Planet Earth (SHAPE) payload, which will now study spectral and polarimetric measurements of Earth from the lunar orbit to be used for finding life outside the Solar System." },
  { frame: 30, text: "Landing a lunar spacecraft from an altitude of 100 kilometers above the Moon is a complex process that involves several stages. The first step is to separate the lander from the propulsion module, which then enters a 100 km x 30 km orbit. This means the farthest it will be from the Moon is 100 km, and the closest is 30 km." },
  { frame: 39, text: "The final approach to the Moon is set to begin at 5:30 pm on August 23 when the spacecraft will be about 100 kilometers above the surface. Isro will initiate the commands preloaded into the systems overboard." },
  { frame: 48, text: "For a spacecraft to land on the surface of the Moon, everything has to be accurate since it is autonomously performed by onboard computers. They take charge of communications, navigations, speed braking, engine firing, and site selection for a smooth touchdown." },
  { frame: 56, text: "At about an altitute of 30 km above the Moon, the lander begins to use its thrusters to navigate down to the surface. The descent is guided by sensors on the lander. In the case of Chandrayaan-3, there is an impressive package of Position Detection Camera, Altimeter, Doppler, Velocity Camera, Inclinometer & Touchdown sensors to guide it in this nerve-wracking final moments." },
  { frame: 61, text: "The spacecraft will initiate a retrograde burn when it is closest to the Moon in orbit to commence the adventurous landing sequence. It will use its main engine for one continuous burn from orbit all the way down to 4 meters above the surface." },
  { frame: 69, text: "The thrusters will be used for attitude control and re-orientation maneuvers with quick response times." },
  { frame: 73, text: "Once the vehicle reaches an altitude of about 100 meters, it starts a hovering segment of up to 100 seconds to acquire imagery of the landing site and perform precise avoidance maneuvers ahead of the vertical descent. After hovering, the vehicle will start a constant low-velocity descent toward the surface, constantly throttling down its engine as the vehicle gets lighter. Precise altitude data is provided by a laser altimeter that is used to provide the final engine cut-off signal." },
  { frame: 87, caps: true, text: "Touchdown. India makes history." },
  { frame: 123, text: "The rover will be prepped for deployment and the process begins an hour or so later once the lunar dust kicked off by the thrusters settle. Isro will perform health checkups on the rover, and ensure communication links are working and the batteries are charged." },
  { frame: 137, text: "As the ramp opens and fixes on the ground, the rover will roll up by using its battery. The solar panels will be activated to absorb the energy radiating from the Sun for instruments to come to life." },
];

// Landing callouts shown for selected frame ranges.
export const LABELS = [
  { range: [13, 16], text: "Vikram Lander", pos: "left", style: { left: '8%', top: '20%' } },
  { range: [17, 20], text: "Propulsion Module", pos: "right", style: { right: '0%', top: '25%' } },
  { range: [90, 113], text: "Pragyan Rover Deployment", pos: "top", style: { right: '8%', top: '40%' } },
];

// Hold-frame ranges used to display alternate still images.
export const POST_INTRO_IMAGE_FRAME_RANGE = [15, 19];
export const POST_INTRO_EARTH_FRAME_RANGE = [20, 25];
// Moon intro sequence that must play before separation starts.
export const PRE_SEPARATION_SEQUENCE_FRAME_RANGE = [1, 11];
// Separation sequence starts from moon frame "video (12).jpg" and flows into landing.
export const SEPARATION_SEQUENCE_FRAME_RANGE = [12, 24];

// Per-frame scroll spacer heights for the moon sequence.
export const FRAME_HEIGHT_BY_MOON_INDEX = new Map([
  [5, '500px'],
  [14, '500px'],
  [16, '500px'],
  [20, '500px'],
  [24, '500px'],
  [30, '500px'],
  [39, '500px'],
  [48, '500px'],
  [56, '500px'],
  [61, '500px'],
  [69, '500px'],
  [73, '500px'],
  [87, '500px'],
  [123, '500px'],
  [137, '500px'],
]);
