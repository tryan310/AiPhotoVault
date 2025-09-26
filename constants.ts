import { Theme, PricingPlan } from './types';
import { BriefcaseIcon, HeartIcon, CameraIcon, TrophyIcon, VintageCameraIcon, SuperheroMaskIcon, SwordIcon, SparklesIcon, CrownIcon, SkullIcon, GiftIcon, DogIcon } from './components/icons';

export const THEMES: Theme[] = [
  {
    id: 'linkedin',
    title: 'LinkedIn',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Transform this selfie into a professional, high-quality headshot suitable for a LinkedIn profile. The background should be a neutral, slightly out-of-focus modern office setting. The lighting should be soft and flattering. The person should be wearing professional business attire.',
    icon: BriefcaseIcon
  },
  {
    id: 'dating',
    title: 'Dating Profile',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Generate a captivating and attractive version of this photo for a dating profile. The setting should be a warm, inviting cafe or a beautiful outdoor park at sunset. The person should have a friendly, approachable expression. The style should be natural and authentic, but enhanced for visual appeal.',
    icon: HeartIcon
  },
  {
    id: 'selfie',
    title: 'Enhanced Selfie',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Enhance this selfie to make it look like it was taken by a professional photographer. Improve the lighting, colors, and skin texture to create a flawless but natural look. Add a subtle, artistic background blur (bokeh effect). The overall mood should be vibrant and energetic.',
    icon: CameraIcon
  },
  {
    id: 'athlete',
    title: 'Athlete',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Reimagine this person as a professional athlete in a dynamic, action-oriented portrait. The setting could be a modern gym or an athletic field. Add dramatic lighting to highlight muscle definition. The person should have a determined, focused expression. The style should be gritty and powerful.',
    icon: TrophyIcon
  },
  {
    id: 'vintage',
    title: 'Vintage',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Recreate this photo with a vintage aesthetic, as if it were taken in the 1950s. Convert the image to black and white or a warm sepia tone. Add a subtle film grain effect. The person\'s attire should be styled to match the era. The background should be a classic, timeless setting.',
    icon: VintageCameraIcon
  },
  {
    id: 'superhero',
    title: 'Superhero',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Transform this person into a superhero in a dynamic, comic book art style. Give them a unique, powerful-looking costume. The background should be a dramatic city skyline at night with bold, vibrant colors and sharp, ink-like shadows. The expression should be heroic and intense.',
    icon: SuperheroMaskIcon
  },
  {
    id: 'fantasy',
    title: 'Fantasy',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Reimagine this person as a character from a high-fantasy world. Style them as an elf, warrior, or mage with appropriate attire and accessories. The background should be an enchanted forest or ancient ruins with mystical, ethereal lighting. The art style should be epic and painterly.',
    icon: SwordIcon
  },
  {
    id: 'anime',
    title: 'Anime',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Convert this photo into a Japanese anime art style. The character should have large, expressive eyes, stylized hair, and clean lines. Use vibrant, cel-shaded colors. The background should be a simple, aesthetically pleasing anime-style scene.',
    icon: SparklesIcon
  },
  {
    id: 'ceo',
    title: 'CEO',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Transform this photo into a powerful executive portrait. The person should be wearing a sharp, expensive business suit in a modern corporate office setting. The lighting should be professional and dramatic, emphasizing authority and success. The background should be a sleek, high-end office or boardroom.',
    icon: CrownIcon
  },
  {
    id: 'halloween',
    title: 'Halloween Costume',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Transform this person into a spooky Halloween character. Create a costume that could be a vampire, zombie, witch, ghost, or other classic Halloween creature. Add dramatic, eerie lighting with shadows and fog. The background should be dark and atmospheric, like a haunted house or graveyard or pumpkin patch.',
    icon: SkullIcon
  },
  {
    id: 'christmas',
    title: 'Christmas',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. Transform this photo into a festive Christmas scene. The person should be wearing holiday attire like an ugly Christmas sweater, Santa hat, or elf costume. The background should be a cozy winter scene with Christmas decorations, snow, and warm holiday lighting.',
    icon: GiftIcon
  },
  {
    id: 'puppy',
    title: 'Puppy',
    prompt: 'Keep the person\'s likeness as close to their original likeness as possible. The person in this image stands or sits or lays among many puppies. They are overwhelmed by the cuteness of the puppies. They are surrounded by a playful swarm of puppies leaping, rolling, and scampering around them in a whirlwind of wagging tails and boundless energy.',
    icon: DogIcon
  }
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '19',
    stripePriceId: 'price_1SBSSwCnTKaHMCugSFppSsNh', // Starter Plan - $19/month
    description: 'Get started with 50 credits and begin your AI photography journey.',
    cta: 'Purchase',
    mainFeatures: [
      '50 AI Photos (credits)',
      'Nano Banana™ HD photorealistic model',
      'Highest quality photos',
      'Take up to 20 photos at a time',
      'Write your own prompts'
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '49',
    stripePriceId: 'price_1SBSSjCnTKaHMCugeN5JgRo3', // Pro Plan - $49/month
    description: 'Generate up to 150 credits worth of photos with enhanced quality and more creative fun.',
    cta: 'Purchase',
    mainFeatures: [
      '150 AI Photos (credits)',
      'Nano Banana™ HD photorealistic model',
      'Highest quality photos',
      'Take up to 20 photos at a time',
      'Write your own prompts'
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '99',
    isPopular: true,
    stripePriceId: 'price_1SBSSXCnTKaHMCugVU2R9IW7', // Premium Plan - $99/month
    description: 'Unlock 500 credits for premium photos, advanced tools, and maximum creative value.',
    cta: 'Purchase',
    mainFeatures: [
      '500 AI Photos (credits)',
      'Nano Banana™ HD photorealistic model',
      'Highest quality photos',
      'Take up to 20 photos at a time',
      'Write your own prompts'
    ],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: '199',
    stripePriceId: 'price_1SBSSFCnTKaHMCugeruD8b6x', // Ultra Plan - $199 one-time
    description: 'Access 2,000 credits, our highest quality, and exclusive features for ultimate value',
    cta: 'Purchase',
    mainFeatures: [
      '2,000 AI Photos (credits)',
      'Nano Banana™ HD photorealistic model',
      'Highest quality photos',
      'Take up to 20 photos at a time',
      'Write your own prompts'
    ],
  },
];