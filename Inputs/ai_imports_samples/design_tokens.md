\# Design Tokens — Orange Hero × Discord Shell



Intent: bold orange-gradient “hero” moments + Discord-like dark surfaces for the app shell.

Default mode: Dark (Discord). Use Orange as the primary accent.



---



\## Color System



\### Neutrals (Discord-ish)

\- bg-0 (app background): #0B0D12

\- bg-1 (sidebar / panels): #0F121A

\- bg-2 (raised surfaces / cards): #151A24

\- bg-3 (hover / active): #1B2230



\- text-0 (primary): #F2F3F5

\- text-1 (secondary): #C7CDD9

\- text-2 (muted): #98A2B3

\- border-0 (hairline): rgba(255,255,255,0.10)

\- border-1 (strong): rgba(255,255,255,0.16)



\### Orange Accent (from reference image)

Use these as the “brand heat” layer.

\- orange-900: #FF3A00

\- orange-800: #FF4D00

\- orange-700: #FF6A00

\- orange-600: #FF7A1A

\- orange-500: #FF8A2A



\### Brand Gradient (hero sections, headers, onboarding)

\- brand-gradient:

&nbsp; - linear-gradient(180deg, #FF3A00 0%, #FF6A00 55%, #FF8A2A 100%)



\### Controls

\- pill-dark: rgba(0,0,0,0.65)  (top pill in reference)

\- pill-dark-border: rgba(255,255,255,0.10)

\- button-primary-bg: #FFFFFF

\- button-primary-text: #0B0D12

\- button-secondary-bg: rgba(255,255,255,0.08)

\- button-secondary-text: #F2F3F5



\### Status

\- success: #2ECC71

\- warning: #F1C40F

\- danger:  #E74C3C

\- info:    #4DA3FF



---



\## Typography



Font families:

\- sans: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI

\- mono: JetBrains Mono, ui-monospace, SFMono-Regular



Type scale:

\- display: 48/52, weight 600  (big headline like reference “Add products…”)

\- h1: 32/40, weight 600

\- h2: 24/32, weight 600

\- body: 14/20, weight 400

\- small: 12/16, weight 400

\- label: 11/14, weight 600, letter-spacing 0.02em



---



\## Spacing (Discord density, but clean)



Base unit: 4px

\- xs: 4

\- sm: 8

\- md: 12

\- lg: 16

\- xl: 24

\- 2xl: 32

\- 3xl: 48



Layout:

\- sidebar width: 280–320

\- panel padding: 16–24

\- topbar height: 56



---



\## Radius (match reference cards + Discord softness)



\- r-xs: 8

\- r-sm: 12

\- r-md: 16

\- r-lg: 20

\- r-xl: 24

\- r-pill: 999



---



\## Shadows / Elevation



Keep soft, modern, slightly “glowy” on orange surfaces.

\- shadow-1: 0 6px 18px rgba(0,0,0,0.25)

\- shadow-2: 0 12px 32px rgba(0,0,0,0.32)

\- glow-orange: 0 12px 40px rgba(255, 90, 0, 0.28)



---



\## Component Tokens



\### Top Bar (Discord shell)

\- topbar-bg: rgba(15,18,26,0.92)

\- topbar-blur: 12px

\- topbar-border: rgba(255,255,255,0.08)



\### Sidebar

\- sidebar-bg: #0F121A

\- sidebar-item-hover: rgba(255,255,255,0.06)

\- sidebar-item-active: rgba(255,255,255,0.10)



\### Cards / Panels

\- panel-bg: rgba(255,255,255,0.06)

\- panel-bg-strong: rgba(255,255,255,0.10)

\- panel-border: rgba(255,255,255,0.10)



\### Buttons

Primary (white “Get started” vibe):

\- btn-primary-bg: #FFFFFF

\- btn-primary-text: #0B0D12

\- btn-primary-radius: r-pill

\- btn-primary-padding: 10px 16px



Secondary (Discord ghost):

\- btn-secondary-bg: rgba(255,255,255,0.08)

\- btn-secondary-hover: rgba(255,255,255,0.12)

\- btn-secondary-text: #F2F3F5

\- btn-secondary-radius: r-pill



\### Inputs

\- input-bg: rgba(255,255,255,0.06)

\- input-border: rgba(255,255,255,0.10)

\- input-focus-ring: rgba(255,255,255,0.16)

\- input-radius: r-md



\### Accent usage rules

\- Orange gradient ONLY for:

&nbsp; - onboarding screens

&nbsp; - “hero” headers

&nbsp; - key call-to-action sections

\- App work surfaces remain dark (Discord-like) for readability.

\- Use orange as:

&nbsp; - selection outline

&nbsp; - active tab underline

&nbsp; - progress highlights

&nbsp; - subtle glow on focused primary actions



---



\## Motion

\- fast: 120ms ease-out

\- normal: 180ms ease-out

\- slow: 260ms ease-out



Hover/press:

\- hover lift: translateY(-1px)

\- press: scale(0.98)



---



\## Iconography

\- style: outline, 1.5–2px stroke

\- icon sizes: 16 / 18 / 20

\- icon button radius: r-pill or r-sm depending on placement

