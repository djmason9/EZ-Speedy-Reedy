<template>
  <div class="eula-backdrop" role="dialog" aria-modal="true" aria-labelledby="eula-title">
    <div class="eula-card">

      <div class="eula-header">
        <i class="bi bi-file-earmark-text-fill"></i>
        <h2 id="eula-title">Terms of Use</h2>
      </div>

      <div class="eula-body">
        <p class="eula-copy">
          <strong>EZ Speedy Reedy</strong> is provided for
          <strong>personal use only</strong>. You may not use this app, or any
          part of its code or design, for any commercial purpose or to generate
          revenue of any kind.
        </p>

        <ul class="eula-list">
          <li><i class="bi bi-check-circle-fill"></i> Personal reading — allowed</li>
          <li><i class="bi bi-x-circle-fill bad"></i> Commercial use of any kind — not allowed</li>
          <li><i class="bi bi-x-circle-fill bad"></i> Selling, licensing, or monetising — not allowed</li>
          <li><i class="bi bi-x-circle-fill bad"></i> Integrating into a revenue-generating product — not allowed</li>
        </ul>

        <p class="eula-copy">
          By clicking <strong>I Agree</strong> you accept these terms.
          Full license: <a href="EULA.md" target="_blank" rel="noopener">EULA.md</a>
        </p>

        <p class="eula-copy copyright">
          © 2025 <a href="https://bitcows.com" target="_blank" rel="noopener">bitcows.com</a>
          — All Rights Reserved
        </p>
      </div>

      <div class="eula-footer">
        <button class="btn-agree" @click="$emit('accepted')">
          <i class="bi bi-check-lg"></i> I Agree
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
defineEmits(['accepted'])
</script>

<style scoped>
.eula-backdrop {
  position: fixed;
  inset: 0;
  background: var(--backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.eula-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 520px;
  overflow: hidden;
}

/* Header */
.eula-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.25rem 1.5rem;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.eula-header i {
  color: var(--accent);
  font-size: 1.3rem;
}

.eula-header h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

/* Body */
.eula-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.eula-copy {
  font-size: 0.92rem;
  color: var(--text);
  line-height: 1.6;
}

.eula-copy a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.eula-copy.copyright {
  font-size: 0.82rem;
  color: var(--text-muted);
  text-align: center;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border-light);
}

.eula-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  background: var(--surface-2);
  border-radius: 8px;
  border: 1px solid var(--border-light);
}

.eula-list li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.88rem;
  color: var(--text);
}

.eula-list i {
  color: var(--accent);
  flex-shrink: 0;
}

.eula-list i.bad {
  color: var(--error-text);
}

/* Footer */
.eula-footer {
  padding: 1rem 1.5rem 1.25rem;
  display: flex;
  justify-content: center;
  border-top: 1px solid var(--border-light);
  background: var(--surface-2);
}

.btn-agree {
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.65rem 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 0 14px var(--accent-glow);
  min-height: 48px;
}

.btn-agree:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 22px var(--accent-glow);
}

@media (max-width: 480px) {
  .eula-backdrop { padding: 1rem; }
  .eula-header, .eula-body, .eula-footer { padding-left: 1rem; padding-right: 1rem; }
  .btn-agree { width: 100%; justify-content: center; }
}
</style>
