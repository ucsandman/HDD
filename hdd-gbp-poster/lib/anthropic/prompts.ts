import { EDUCATIONAL_TOPICS } from '@/types'

export const BASE_SYSTEM_PROMPT = `You are a social media content writer for Hickory Dickory Decks, a composite deck building company in Cincinnati, Ohio. You write Google Business Profile posts that are:

- Friendly and professional, never salesy or pushy
- Focused on helping homeowners, not hard selling
- Locally relevant to Cincinnati and surrounding areas (West Chester, Mason, Loveland, Anderson Township, Blue Ash)
- Knowledgeable about composite/PVC decking benefits (low maintenance, durability, no staining)

Business context:
- Owners: Nathan and Brinton Ricke (brothers)
- Specialties: Composite and PVC decking, hot tub decks, pool decks, pergolas, railings
- Backed by 35+ years of Hickory Dickory Decks franchise experience
- Service area: Greater Cincinnati, Hamilton, Butler, Warren, and Clermont counties

Write posts that feel like they come from a local business owner who genuinely cares about helping people create great outdoor spaces. Keep posts under 1500 characters (Google's limit). Do not use hashtags. End with a soft call to action when appropriate.`

export function getSystemPrompt(contextInfo?: string | null): string {
  let prompt = BASE_SYSTEM_PROMPT

  if (contextInfo) {
    prompt += `\n\nAdditional context about this franchise:\n${contextInfo}`
  }

  return prompt
}

export interface ProjectShowcaseParams {
  projectTypeName?: string
  neighborhood?: string
  materials?: string
  features?: string
}

export function getProjectShowcasePrompt(params: ProjectShowcaseParams): string {
  const projectType = params.projectTypeName || 'deck'
  const neighborhood = params.neighborhood
    ? `Neighborhood/area: ${params.neighborhood}`
    : 'Neighborhood/area: Cincinnati area'
  const materials = params.materials
    ? `Materials: ${params.materials}`
    : ''
  const features = params.features
    ? `Special features: ${params.features}`
    : ''

  return `Write a Google Business Profile post showcasing a recently completed ${projectType} project.

Details:
- Project type: ${projectType}
- ${neighborhood}
${materials ? `- ${materials}` : ''}
${features ? `- ${features}` : ''}

The tone should be proud but humble. Focus on how the homeowner can now enjoy their outdoor space. Do not mention specific prices or timelines.`
}

export interface EducationalParams {
  topic?: string
}

export function getEducationalPrompt(params: EducationalParams): string {
  const topic = params.topic || EDUCATIONAL_TOPICS[0]

  return `Write an educational Google Business Profile post about: ${topic}

This should provide genuine value to homeowners considering a deck. Be helpful and informative, not promotional. You can mention Hickory Dickory Decks naturally but the focus is on educating the reader.

Keep it conversational and avoid being preachy or listicle-style.`
}

export interface SeasonalParams {
  season?: string
}

export function getSeasonalPrompt(params: SeasonalParams): string {
  const season = params.season || getCurrentSeason()

  let seasonalGuidance = ''
  switch (season.toLowerCase()) {
    case 'spring':
      seasonalGuidance = 'Focus on enjoying outdoor spaces as the weather warms up. Mention the excitement of spring and spending time outside.'
      break
    case 'summer':
      seasonalGuidance = 'Focus on summer gatherings, cookouts, and making the most of outdoor living spaces.'
      break
    case 'fall':
      seasonalGuidance = "Mention it's a great time to plan/build (better contractor availability, enjoy it next spring)."
      break
    case 'winter':
      seasonalGuidance = 'Focus on planning ahead for spring. Good time to design and schedule a build.'
      break
  }

  return `Write a seasonal Google Business Profile post appropriate for ${season}.

${seasonalGuidance}

Connect the season to outdoor living and deck enjoyment. Keep it light and genuine. Don't be pushy about booking.`
}

function getCurrentSeason(): string {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 10) return 'Fall'
  return 'Winter'
}

export type PostTypePromptParams = ProjectShowcaseParams | EducationalParams | SeasonalParams

export function getPromptForPostType(
  postType: 'project_showcase' | 'educational' | 'seasonal',
  params: PostTypePromptParams
): string {
  switch (postType) {
    case 'project_showcase':
      return getProjectShowcasePrompt(params as ProjectShowcaseParams)
    case 'educational':
      return getEducationalPrompt(params as EducationalParams)
    case 'seasonal':
      return getSeasonalPrompt(params as SeasonalParams)
  }
}

export interface BlogPromptParams {
  topic: string
  neighborhood?: string
  materials?: string
  targetKeywords?: string[]
}

export function getBlogPrompt(params: BlogPromptParams): string {
  const { topic, neighborhood, materials, targetKeywords } = params
  
  const localContext = neighborhood ? ` specifically for homeowners in the ${neighborhood} area of Cincinnati` : ' for Cincinnati homeowners'
  const materialContext = materials ? ` highlighting the use of ${materials}` : ''
  const keywordsContext = targetKeywords && targetKeywords.length > 0 
    ? `\nTarget Keywords to include naturally: ${targetKeywords.join(', ')}` 
    : ''

  return `Write a comprehensive, SEO-optimized blog post about: "${topic}"${localContext}.${materialContext}

The blog should be approximately 1,200 words and follow this structure:
1. **Engaging Title (H1)**: Catchy and SEO-friendly.
2. **Introduction**: Set the scene, address common homeowner pain points, and introduce Hickory Dickory Decks.
3. **Core Content (H2 & H3)**: Detailed sections providing genuine value, tips, and professional insights. Use bullet points for readability.
4. **Local Relevance**: Mention Cincinnati-specific considerations (weather, local building codes, popular styles in areas like West Chester or Mason).
5. **Conclusion**: Summarize key takeaways.
6. **Soft Call to Action**: Encourage readers to book a free consultation or visit our local showroom.

**Tone Guidelines**:
- Professional yet conversational "expert neighbor" voice.
- Focus on the benefits of composite/PVC decking (low maintenance, durability).
- Informative and helpful, not pushy or aggressive.
${keywordsContext}

Please also provide:
- **Meta Title** (max 60 chars)
- **Meta Description** (max 160 chars)
- **Slug** (URL-friendly version of the title)
- **3-5 suggested tags/keywords**

Format the output clearly with markers for [TITLE], [SLUG], [CONTENT], [META_TITLE], [META_DESCRIPTION], and [KEYWORDS].`
}

export function getGBPSummaryPrompt(blogContent: string): string {
  return `Act as a social media manager for Hickory Dickory Decks Cincinnati. 

Read the following blog post and create a compelling Google Business Profile (GBP) post that summarizes the key takeaways and drives traffic to read the full article.

**GBP Post Requirements**:
- Length: Under 1,500 characters.
- Tone: Friendly, professional, and local.
- Structure: Catchy opening + 3 bulleted key points + "Learn More" call to action.
- Content: Distill the most valuable advice from the blog.
- Formatting: Do not use hashtags. Use emojis sparingly.

**Blog Content to Summarize**:
${blogContent.slice(0, 5000)} ... [content truncated]`
}
