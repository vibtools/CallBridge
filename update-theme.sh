#!/bin/bash
sed -i 's/--bg: .*/--bg: #F1F5F9;/g' src/styles/globals.css
sed -i 's/--surface: .*/--surface: #FFFFFF;/g' src/styles/globals.css
sed -i 's/--border: .*/--border: #E2E8F0;/g' src/styles/globals.css
sed -i 's/--text: .*/--text: #0F172A;/g' src/styles/globals.css
sed -i 's/--muted: .*/--muted: #64748B;/g' src/styles/globals.css

# Update badges
sed -i 's/--success-bg: .*/--success-bg: #ECFDF5;/g' src/styles/globals.css
sed -i 's/--success-text: .*/--success-text: #047857;/g' src/styles/globals.css
sed -i 's/--info-bg: .*/--info-bg: #EFF6FF;/g' src/styles/globals.css
sed -i 's/--info-text: .*/--info-text: #1D4ED8;/g' src/styles/globals.css
sed -i 's/--warning-bg: .*/--warning-bg: #FFFBEB;/g' src/styles/globals.css
sed -i 's/--warning-text: .*/--warning-text: #B45309;/g' src/styles/globals.css
sed -i 's/--danger-bg: .*/--danger-bg: #FEF2F2;/g' src/styles/globals.css
sed -i 's/--danger-text: .*/--danger-text: #B91C1C;/g' src/styles/globals.css

# Table updates (height 40px, font 13px)
sed -i 's/\.data-table td { height: 40px; padding: 0 9px; border-bottom: 1px solid var(--table-divider); font-size: 10.5px; color: var(--table-text); }/\.data-table td { height: 40px; padding: 0 12px; border-bottom: 1px solid var(--table-divider); font-size: 13px; color: var(--text); }/g' src/styles/globals.css

