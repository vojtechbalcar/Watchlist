import styles from "@/app/landing/landing.module.css";

/** A vector metaphor for relative returns; arrow geometry is illustrative. */
export function LandingIllustration() {
  return (
    <svg className={styles.illustration} viewBox="0 0 680 640" role="img" aria-labelledby="landing-art-title landing-art-description">
      <title id="landing-art-title">Going up isn’t the same as getting ahead.</title>
      <desc id="landing-art-description">Two sculpted green arrows rise together. The market climbs higher: up 22.1 percent against your stock’s 18.7 percent. Both gained, but the stock finished 3.4 percentage points behind. Illustrative one-year returns.</desc>
      <defs>
        <pattern id="landing-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#b6a5ad" /></pattern>
        <clipPath id="landing-orbit-clip"><circle cx="367" cy="295" r="236" /></clipPath>
      </defs>

      {/* A brand-colored backdrop, independent of the direction of either arrow. */}
      <circle cx="367" cy="295" r="236" fill="#eee7ea" />
      <circle cx="367" cy="295" r="189" fill="none" stroke="#ded1d7" />
      <circle cx="367" cy="295" r="138" fill="none" stroke="#ded1d7" />
      <path d="M94 405 643 91M91 505 644 191M114 593 645 289" stroke="#ded1d7" strokeDasharray="3 7" clipPath="url(#landing-orbit-clip)" />
      <path d="M387 379h260v190H387z" fill="url(#landing-dots)" clipPath="url(#landing-orbit-clip)" opacity=".55" />
      <ellipse cx="319" cy="558" rx="215" ry="20" fill="#dce0dd" opacity=".6" />

      <g className={styles.marketArrow}>
        <path d="m156 470 150-150v-98L451 77l-37-37h134v134l-37-37-146 146v65L201 513z" transform="translate(0 19)" fill="#365e4e" stroke="#365e4e" strokeWidth="2" strokeLinejoin="round" />
        <path d="m156 470 150-150v-98L451 77l-37-37h134v134l-37-37-146 146v65L201 513z" fill="#79ab8d" stroke="#365e4e" strokeWidth="2" strokeLinejoin="round" />
        <path d="m179 490 157-157v-81L499 89" fill="none" stroke="#d9e8de" strokeWidth="2" strokeDasharray="10 10" />
        <path d="M414 40h134v134" fill="none" stroke="#b4d0bf" strokeWidth="2" />
      </g>

      <g className={styles.stockArrow}>
        <path d="m68 512 148-148h62l92-92-36-36h126v126l-37-37-122 122h-47L112 558z" transform="translate(0 19)" fill="#6d8974" stroke="#486651" strokeWidth="2" strokeLinejoin="round" />
        <path d="m68 512 148-148h62l92-92-36-36h126v126l-37-37-122 122h-47L112 558z" fill="#c3d6b7" stroke="#486651" strokeWidth="2" strokeLinejoin="round" />
        <path d="m89 534 148-129h53l123-123" fill="none" stroke="#f4f7ec" strokeWidth="2" strokeDasharray="10 10" />
        <path d="M334 236h126v126" fill="none" stroke="#e6eedd" strokeWidth="2" />
      </g>

      {/* Labels stay outside the arrows so the sculpture remains the focal point. */}
      <g className={styles.marketTag}>
        <g transform="rotate(7 560 164)">
          <path d="M479 119h152v87H479z" fill="#dcded9" transform="translate(4 5)" />
          <rect x="479" y="119" width="152" height="87" rx="3" fill="#fafbf7" stroke="#365e4e" strokeWidth="1.5" />
          <text x="495" y="143" fill="#4b6255" fontSize="12">THE MARKET</text>
          <text x="493" y="183" fill="#365e4e" fontSize="34" fontWeight="500" letterSpacing="-1.5">+22.1%</text>
        </g>
      </g>
      <g className={styles.stockTag}>
        <path d="M129 341q-2 30 83 61" fill="none" stroke="#718676" strokeWidth="1.3" strokeDasharray="4 5" />
        <g transform="rotate(-9 122 297)">
          <path d="M36 251h175v91H36z" fill="#dcded9" transform="translate(4 5)" />
          <rect x="36" y="251" width="175" height="91" rx="3" fill="#fafbf7" stroke="#486651" strokeWidth="1.5" />
          <text x="54" y="277" fill="#4b6255" fontSize="12">YOUR STOCK</text>
          <text x="51" y="320" fill="#486651" fontSize="38" fontWeight="500" letterSpacing="-1.5">+18.7%</text>
        </g>
      </g>

      <g transform="rotate(-5 508 468)">
        <path d="M402 406h214v125H402z" fill="#d6d3d1" transform="translate(5 7)" />
        <path d="M402 406h214v47a8 8 0 0 0 0 16v62H402v-62a8 8 0 0 0 0-16z" fill="#fafbf7" stroke="#303332" strokeWidth="1.5" />
        <text x="420" y="432" fontSize="12" fill="#555b57">THE PART YOU’RE MISSING</text>
        <path d="M414 453h189" stroke="#c8ccc7" strokeDasharray="3 4" />
        <text x="419" y="497" fontSize="38" fontWeight="500" letterSpacing="-1.6" fill="#aa493e">−3.4<tspan fontSize="17" letterSpacing="0"> pp</tspan></text>
        <text x="420" y="516" fontSize="11" fill="#555b57">behind the benchmark</text>
      </g>

      <g fill="none" stroke="#8c3b52" strokeWidth="2">
        <path d="M143 115v24m-12-12h24" />
        <path d="M590 349v16m-8-8h16" />
        <circle cx="277" cy="99" r="5" />
      </g>
      <path d="m77 178 6-9 6 9-6 9z" fill="#8c3b52" />
      <path d="m240 575 10 10-10 10-10-10z" fill="#8c3b52" opacity=".55" />
      <path d="M272 583h51m-10-5 10 5-10 5" stroke="#8c3b52" strokeWidth="1.5" fill="none" />
      <text x="333" y="588" fontSize="12" fill="#686c68" fontStyle="italic">a little perspective changes everything.</text>
    </svg>
  );
}
