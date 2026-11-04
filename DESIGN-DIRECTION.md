# Design direction

## Visual system

- **Ink — `#080809`:** the black field of the second section and the circular portrait studies.
- **Night — `#10100F`:** the intro surround, kept visually continuous with the existing footage.
- **Film white — `#ECEAE5`:** restrained dividers and supporting interface text.
- **Pure white — `#FFFFFF`:** card names and the persistent navigation arrow.
- **Memory red — `rgba(153, 18, 38, .22)`:** a quiet color leak inside the portrait treatment, not a new section accent.
- **Rain blue — `rgba(34, 108, 145, .18)`:** a cool counter-tone in the same fine film texture.

## Type

Use the existing Neue Haas Grotesk local-first stack as the page voice, with the bundled Montserrat files as its current fallback. Preserve the restrained, clean sans-serif character of the reference; enlarge supporting text where it needs to be read inside a circular crop.

## Layout

```text
INTRO:      [full-bleed film, unchanged]                         [down arrow]
            [sound control]
            ───────────────── quiet pale divider ─────────────────

PORTRAITS:  (portrait)     (portrait)     (portrait)
             (portrait)     (portrait)     (portrait)
                           (portrait)
```

Cards remain circular, with the photograph as the main image and one fine inner ring. On smaller screens, the layout becomes one centered circle per row. The scene analysis opens inside its circle and remains keyboard accessible.

## Principles and review

Keep the intro as the signature moment. Let the portraits carry the second section; retain only the existing film grain, restrained red/blue color cast, thin white lines, slow image drift, and scroll reveal. Avoid adding headlines, decorative badges, extra text, or motion that competes with the film.

The current build already follows the chosen palette and circular portrait direction. The review found accumulated duplicate CSS rules, small card controls, and a reduced-motion handler that paused the intro video. The implementation consolidates the stylesheet, enlarges the card disclosure target and secondary copy, and limits reduced-motion behavior to decorative UI motion. The user's instruction that the video keeps playing takes precedence for the intro.
