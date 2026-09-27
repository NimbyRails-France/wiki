<script setup lang="ts">
import { articles } from '~/content'
useSeoMeta({
  title: 'Créer des mods en Kotlin — Wiki NimbyRails France',
  description:
    'Apprenez à créer des mods NIMBY Rails en Kotlin. Guides, exemples, types et référence du SDK NimbyRails France.',
})
useHead({ link: [{ rel: 'canonical', href: 'https://wiki.nimbyrails-france.fr/' }] })
const paths = [
  {
    number: '01',
    title: 'Votre premier mod',
    text: 'Créez votre projet, ajoutez le SDK et écrivez votre premier signal, étape par étape.',
    to: '/commencer/installation',
    label: 'Créer mon premier signal',
  },
  {
    number: '02',
    title: 'Donnez-lui vos règles',
    text: 'Réglages, indications, textures et conduite : votre mod choisit son comportement.',
    to: '/mods/signaux',
    label: 'Comprendre les signaux',
  },
  {
    number: '03',
    title: 'Explorez le SDK',
    text: 'Trains, voies, horloge et commandes. Retrouvez les signatures et les types Kotlin.',
    to: '/reference',
    label: 'Consulter la référence',
  },
]
const preview = `signal("monmod.signal", "Mon signal", "mes_textures") {
    rules {
        when {
            !fresh || !routeKnown -> fermé
            block == Occupancy.Clear -> ouvert
            else -> fermé
        }
    }
}`
</script>
<template>
  <WikiShell>
    <div class="home-content">
      <div class="home-topline">
        <span>Documentation officielle</span><span><i class="status-dot" /> Kotlin · Windows</span>
      </div>
      <section class="hero">
        <div>
          <p class="eyebrow"><span /> LE GUIDE DES CRÉATEURS</p>
          <h1>Vos idées.<br />Votre réseau.<br /><em>Vos mods.</em></h1>
          <p class="hero-description">
            Créez pour NIMBY Rails avec Kotlin.<br />Du premier signal aux comportements avancés, un
            guide pour comprendre et construire.
          </p>
          <div class="hero-actions">
            <NuxtLink class="button primary" to="/commencer/installation"
              >Commencer un mod <span>↗</span></NuxtLink
            ><NuxtLink class="button secondary" to="/reference"
              >Explorer l’API <span>→</span></NuxtLink
            >
          </div>
        </div>
        <div class="hero-code">
          <CodeBlock :code="preview" title="Vos règles · Kotlin" />
          <p class="hero-code-caption">
            <span>Votre signal. Votre comportement.</span><span>Extrait de déclaration</span>
          </p>
        </div>
      </section>
      <div class="release-note">
        <span class="badge">SDK 0.8</span>
        <p>
          Cette édition suit le SDK 0.8 en développement. Les fonctions expérimentales sont
          indiquées sur leur page.
        </p>
      </div>
      <section class="learning-path">
        <div class="section-heading">
          <div>
            <p class="eyebrow">À VOTRE RYTHME</p>
            <h2>Un point de départ pour chacun.</h2>
          </div>
          <span>Kotlin, du débutant à l’avancé</span>
        </div>
        <div class="path-grid">
          <NuxtLink v-for="path in paths" :key="path.number" :to="path.to" class="path-card"
            ><span class="path-number">{{ path.number }}</span>
            <h3>{{ path.title }}</h3>
            <p>{{ path.text }}</p>
            <strong>{{ path.label }} <span>→</span></strong></NuxtLink
          >
        </div>
      </section>
      <section class="reference-banner">
        <div>
          <p class="eyebrow">LA RÉFÉRENCE À PORTÉE DE MAIN</p>
          <h2>Un type. Une question.<br />Une réponse concrète.</h2>
          <p>
            Paramètres, unités, valeurs absentes et exemples : retrouvez les contrats de l’API sans
            chercher dans le code natif.
          </p>
        </div>
        <div class="quick-links">
          <NuxtLink to="/reference/trackmetric"
            >TrackMetric <span>Distance et position ↗</span></NuxtLink
          ><NuxtLink to="/reference/automaticdriving"
            >AutomaticDriving <span>Consignes du mod ↗</span></NuxtLink
          ><NuxtLink to="/lire/horloge">SimulationClock <span>Le temps du jeu ↗</span></NuxtLink>
        </div>
      </section>
      <p class="home-footnote">
        {{ articles.length }} pages · Exemples en Kotlin · Documentation versionnée sur GitHub
      </p>
    </div>
  </WikiShell>
</template>
