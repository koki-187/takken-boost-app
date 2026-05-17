with open(r'C:/takken-build/src/index-v9.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('function renderLP() {')
if start == -1:
    print('renderLP not found')
    exit()

end_marker = '\n}\n\n// ===== FLASHCARD'
end = content.find(end_marker, start)
if end == -1:
    print('end marker not found')
    exit()

# New renderLP using master LP design image with overlay CTAs
# Note: backticks must be escaped \` for outer template literal
new_func = '''function renderLP() {
  document.body.classList.add('lp-mode');
  document.getElementById('main').innerHTML = \\`
<div class="lp-container" style="background:#0a0e27;margin:-16px;padding:0">
  <!-- Master LP design image with overlay CTAs -->
  <div class="lp-master-wrap">
    <picture>
      <source media="(max-width:600px)" srcset="/lp-assets/lp-master-600.webp">
      <img src="/lp-assets/lp-master-1920.webp" alt="宅建BOOST LP - AI時代の宅建学習プラットフォーム" class="lp-master-img" loading="eager">
    </picture>

    <!-- Overlay: Top-right CTA (header 無料で体験する) -->
    <button class="lp-overlay-btn lp-cta-header" onclick="document.body.classList.remove('lp-mode');nav('home')" aria-label="無料で体験する">
      無料で体験する
    </button>

    <!-- Overlay: Hero CTA (まずは無料で体験する) -->
    <button class="lp-overlay-btn lp-cta-hero" onclick="document.body.classList.remove('lp-mode');nav('home')" aria-label="まずは無料で体験する">
      <span>🚀 まずは無料で体験する →</span>
    </button>

    <!-- Overlay: Final CTA (宅建BOOSTで、最短合格へ) -->
    <button class="lp-overlay-btn lp-cta-final" onclick="document.body.classList.remove('lp-mode');nav('home')" aria-label="宅建BOOSTで最短合格へ">
      <span>🎓 宅建BOOSTで、最短合格へ。 →</span>
    </button>
  </div>

  <!-- Footer -->
  <footer class="lp-footer">
    <div class="lp-footer-inner">
      <div class="lp-footer-brand">
        <strong style="color:#22d3ee">🚀 宅建BOOST</strong>
        <span style="font-size:11px;color:#94a3b8;margin-left:8px">合同会社My Agent works 運営</span>
      </div>
      <nav class="lp-footer-nav">
        <a href="#" onclick="document.body.classList.remove('lp-mode');nav('help');return false">使い方</a>
        <a href="#" onclick="document.body.classList.remove('lp-mode');nav('home');return false">機能紹介</a>
        <span style="color:#475569">|</span>
        <a href="#" onclick="alert('利用規約は準備中です');return false">利用規約</a>
        <a href="#" onclick="alert('プライバシーポリシーは準備中です');return false">プライバシーポリシー</a>
        <a href="#" onclick="alert('特定商取引法に基づく表記は準備中です');return false">特定商取引法に基づく表記</a>
      </nav>
      <div style="font-size:10px;color:#64748b;margin-top:8px;text-align:center">
        © 2026 宅建BOOST · 完全無料・登録不要 · <strong style="color:#22d3ee">takken-boost.pages.dev</strong>
      </div>
    </div>
  </footer>
</div>
\\`;
}'''

content_new = content[:start] + new_func + content[end:]

with open(r'C:/takken-build/src/index-v9.tsx', 'w', encoding='utf-8') as f:
    f.write(content_new)

print('renderLP rewritten')
