import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

abstract class AppTextStyles {
  // ── Display / Headings — Syne ─────────────────────────────────────────────
  static TextStyle displayLg = GoogleFonts.syne(
    fontSize: 32,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.04 * 32,
  );

  static TextStyle displayMd = GoogleFonts.syne(
    fontSize: 24,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.03 * 24,
  );

  static TextStyle headingLg = GoogleFonts.syne(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.025 * 20,
  );

  static TextStyle headingMd = GoogleFonts.syne(
    fontSize: 17,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.02 * 17,
  );

  static TextStyle headingSm = GoogleFonts.syne(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.01 * 14,
  );

  // ── Body — Plus Jakarta Sans ──────────────────────────────────────────────
  static TextStyle bodyLg = GoogleFonts.plusJakartaSans(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.01 * 16,
  );

  static TextStyle bodyMd = GoogleFonts.plusJakartaSans(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.01 * 14,
  );

  static TextStyle bodySm = GoogleFonts.plusJakartaSans(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    letterSpacing: 0,
  );

  static TextStyle labelMd = GoogleFonts.plusJakartaSans(
    fontSize: 13,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.01 * 13,
  );

  static TextStyle labelSm = GoogleFonts.plusJakartaSans(
    fontSize: 11,
    fontWeight: FontWeight.w700,
    letterSpacing: 0.07 * 11,
  );

  static TextStyle caption = GoogleFonts.plusJakartaSans(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    letterSpacing: 0,
  );

  // ── Numbers / Data — JetBrains Mono ──────────────────────────────────────
  static TextStyle numberXl = GoogleFonts.jetBrainsMono(
    fontSize: 28,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02 * 28,
    fontFeatures: [const FontFeature.tabularFigures()],
  );

  static TextStyle numberLg = GoogleFonts.jetBrainsMono(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.02 * 22,
    fontFeatures: [const FontFeature.tabularFigures()],
  );

  static TextStyle numberMd = GoogleFonts.jetBrainsMono(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.01 * 16,
    fontFeatures: [const FontFeature.tabularFigures()],
  );

  static TextStyle numberSm = GoogleFonts.jetBrainsMono(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    letterSpacing: 0,
    fontFeatures: [const FontFeature.tabularFigures()],
  );

  // ── Button ────────────────────────────────────────────────────────────────
  static TextStyle button = GoogleFonts.plusJakartaSans(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.01 * 14,
  );

  static TextStyle buttonSm = GoogleFonts.plusJakartaSans(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0,
  );
}
