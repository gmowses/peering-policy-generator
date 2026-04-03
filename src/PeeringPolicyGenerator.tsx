import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, FileText, Copy, CheckCircle2, Plus, Trash2 } from 'lucide-react'

const translations = {
  en: {
    title: 'Peering Policy Generator',
    subtitle: 'Generate a structured peering policy document for your network. Fill in your details and export a ready-to-publish policy.',
    sections: {
      general: 'General Information',
      policy: 'Peering Policy',
      requirements: 'Technical Requirements',
      locations: 'Peering Locations',
      contact: 'Contact Information',
    },
    fields: {
      asn: 'ASN',
      networkName: 'Network / Company Name',
      peeringType: 'Peering Type',
      trafficRatio: 'Traffic Ratio Requirement',
      minPrefixes: 'Minimum Prefixes',
      nocEmail: 'NOC Email',
      nocPhone: 'NOC Phone',
      peeringEmail: 'Peering Email',
      website: 'Website',
      peeringDb: 'PeeringDB Profile URL',
      addIxp: 'Add IXP',
      ixpName: 'IXP Name',
      ixpCity: 'City',
      ixpSpeeds: 'Speeds Available',
      ipv4: 'IPv4 Address',
      ipv6: 'IPv6 Address',
      notes: 'Additional Notes',
    },
    peeringTypes: {
      open: 'Open – Peer with anyone meeting basic requirements',
      selective: 'Selective – Peer on a case-by-case basis',
      restrictive: 'Restrictive – Peer only with specific partners',
    },
    generate: 'Generate Policy',
    copy: 'Copy',
    copied: 'Copied!',
    output: 'Policy Document',
    builtBy: 'Built by',
    references: 'References',
    refList: [
      'RFC 7948 – Internet Exchange BGP Route Server Operations',
      'PeeringDB – https://www.peeringdb.com',
      'EURO-IX Peering Policy Recommendations',
    ],
  },
  pt: {
    title: 'Gerador de Politica de Peering',
    subtitle: 'Gere um documento estruturado de politica de peering para sua rede. Preencha seus dados e exporte uma politica pronta para publicacao.',
    sections: {
      general: 'Informacoes Gerais',
      policy: 'Politica de Peering',
      requirements: 'Requisitos Tecnicos',
      locations: 'Locais de Peering',
      contact: 'Informacoes de Contato',
    },
    fields: {
      asn: 'ASN',
      networkName: 'Rede / Nome da Empresa',
      peeringType: 'Tipo de Peering',
      trafficRatio: 'Requisito de Razao de Trafego',
      minPrefixes: 'Minimo de Prefixos',
      nocEmail: 'Email do NOC',
      nocPhone: 'Telefone do NOC',
      peeringEmail: 'Email de Peering',
      website: 'Website',
      peeringDb: 'URL do Perfil PeeringDB',
      addIxp: 'Adicionar IXP',
      ixpName: 'Nome do IXP',
      ixpCity: 'Cidade',
      ixpSpeeds: 'Velocidades Disponiveis',
      ipv4: 'Endereco IPv4',
      ipv6: 'Endereco IPv6',
      notes: 'Notas Adicionais',
    },
    peeringTypes: {
      open: 'Aberto – Peering com qualquer rede que atenda requisitos basicos',
      selective: 'Seletivo – Peering caso a caso',
      restrictive: 'Restritivo – Peering apenas com parceiros especificos',
    },
    generate: 'Gerar Politica',
    copy: 'Copiar',
    copied: 'Copiado!',
    output: 'Documento de Politica',
    builtBy: 'Criado por',
    references: 'Referencias',
    refList: [
      'RFC 7948 – Operacoes de Route Server BGP em Internet Exchange',
      'PeeringDB – https://www.peeringdb.com',
      'Recomendacoes de Politica de Peering EURO-IX',
    ],
  },
} as const

type Lang = keyof typeof translations
type PeeringType = keyof typeof translations.en.peeringTypes

interface IxpEntry { id: number; name: string; city: string; speeds: string; ipv4: string; ipv6: string }

let ixpId = 1

function generatePolicy(fields: Record<string, string>, peeringType: PeeringType, ixps: IxpEntry[], lang: Lang): string {
  const t = translations[lang]
  const date = new Date().toISOString().slice(0, 10)
  const policyLabel = { open: 'OPEN', selective: 'SELECTIVE', restrictive: 'RESTRICTIVE' }[peeringType]

  return `================================================================================
PEERING POLICY — ${(fields.networkName || 'Network Name').toUpperCase()}
AS${fields.asn || 'XXXXX'}
Last Updated: ${date}
================================================================================

1. GENERAL INFORMATION
----------------------
Network Name   : ${fields.networkName || 'N/A'}
ASN            : AS${fields.asn || 'XXXXX'}
PeeringDB      : ${fields.peeringDb || 'https://www.peeringdb.com/net/XXXXX'}
Website        : ${fields.website || 'https://example.com'}

2. PEERING POLICY TYPE
-----------------------
Policy         : ${policyLabel}
Description    : ${t.peeringTypes[peeringType]}

3. TECHNICAL REQUIREMENTS
--------------------------
Traffic Ratio  : ${fields.trafficRatio || '1:5 inbound/outbound ratio maximum'}
Min. Prefixes  : ${fields.minPrefixes || '1'}
IPv4           : Required
IPv6           : Preferred
RPKI           : ROA-signed prefixes preferred, Invalid routes rejected
IRR Filtering  : Route filtering based on IRR (RADB, RIPE, ARIN)
Max-Prefix     : Enforced (session dropped if exceeded by 110%)
No-Export      : Respect no-export community

4. PEERING LOCATIONS (Internet Exchange Points)
------------------------------------------------
${ixps.length === 0 ? 'No IXP locations configured.' : ixps.map(ixp => `
IXP            : ${ixp.name}
City           : ${ixp.city}
Speeds         : ${ixp.speeds}
${ixp.ipv4 ? `IPv4 Address   : ${ixp.ipv4}` : ''}
${ixp.ipv6 ? `IPv6 Address   : ${ixp.ipv6}` : ''}
`.trim()).join('\n\n')}

5. CONTACT INFORMATION
-----------------------
NOC Email      : ${fields.nocEmail || 'noc@example.com'}
NOC Phone      : ${fields.nocPhone || '+1-XXX-XXX-XXXX'}
Peering Email  : ${fields.peeringEmail || 'peering@example.com'}
Response SLA   : Business hours, within 24 hours

6. BGP COMMUNITIES (Informational)
------------------------------------
${fields.asn || 'XXXXX'}:100    — Customer route
${fields.asn || 'XXXXX'}:200    — Peering route
${fields.asn || 'XXXXX'}:300    — Transit route
${fields.asn || 'XXXXX'}:666    — Blackhole request (RFC 7999)

7. ADDITIONAL NOTES
--------------------
${fields.notes || 'Contact peering@example.com to request peering.'}

================================================================================
Generated by BGP Peering Policy Generator — https://gmowses.github.io/peering-policy-generator
================================================================================`
}

export default function PeeringPolicyGenerator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [fields, setFields] = useState<Record<string, string>>({
    asn: '65000', networkName: 'Example Network', nocEmail: 'noc@example.com', peeringEmail: 'peering@example.com',
    website: 'https://example.com', peeringDb: 'https://www.peeringdb.com/net/1', trafficRatio: '1:5 ratio maximum', minPrefixes: '1',
  })
  const [peeringType, setPeeringType] = useState<PeeringType>('open')
  const [ixps, setIxps] = useState<IxpEntry[]>([{ id: ixpId++, name: 'DE-CIX Frankfurt', city: 'Frankfurt, DE', speeds: '1G, 10G, 100G', ipv4: '', ipv6: '' }])
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }))

  const addIxp = () => setIxps(i => [...i, { id: ixpId++, name: '', city: '', speeds: '1G, 10G', ipv4: '', ipv6: '' }])
  const removeIxp = (id: number) => setIxps(i => i.filter(x => x.id !== id))
  const updateIxp = (id: number, k: keyof IxpEntry, v: string) => setIxps(i => i.map(x => x.id === id ? { ...x, [k]: v } : x))

  const generate = () => {
    setOutput(generatePolicy(fields, peeringType, ixps, lang))
  }

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const inputCls = 'rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full'
  const labelCls = 'text-xs text-zinc-500 block mb-1'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-white" />
            </div>
            <span className="font-semibold">Peering Policy Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/peering-policy-generator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          {/* General */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="font-semibold text-sm">{t.sections.general}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t.fields.asn}</label>
                <input value={fields.asn ?? ''} onChange={e => set('asn', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.networkName}</label>
                <input value={fields.networkName ?? ''} onChange={e => set('networkName', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.website}</label>
                <input value={fields.website ?? ''} onChange={e => set('website', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.peeringDb}</label>
                <input value={fields.peeringDb ?? ''} onChange={e => set('peeringDb', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* Policy type */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="font-semibold text-sm">{t.sections.policy}</h2>
            <div className="grid gap-3">
              {(Object.keys(t.peeringTypes) as PeeringType[]).map(pt => (
                <label key={pt} className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${peeringType === pt ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-cyan-300 dark:hover:border-cyan-700'}`}>
                  <input type="radio" checked={peeringType === pt} onChange={() => setPeeringType(pt)} className="mt-0.5 accent-cyan-500" />
                  <div>
                    <span className="text-sm font-medium capitalize">{pt}</span>
                    <p className="text-xs text-zinc-500 mt-0.5">{t.peeringTypes[pt]}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="font-semibold text-sm">{t.sections.requirements}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t.fields.trafficRatio}</label>
                <input value={fields.trafficRatio ?? ''} onChange={e => set('trafficRatio', e.target.value)} placeholder="1:5 ratio maximum" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.minPrefixes}</label>
                <input type="number" value={fields.minPrefixes ?? ''} onChange={e => set('minPrefixes', e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>

          {/* IXP Locations */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">{t.sections.locations}</h2>
              <button onClick={addIxp} className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 transition-colors">
                <Plus size={12} />{t.fields.addIxp}
              </button>
            </div>
            {ixps.map(ixp => (
              <div key={ixp.id} className="rounded-lg border border-zinc-100 dark:border-zinc-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">{t.fields.ixpName}</span>
                  {ixps.length > 1 && <button onClick={() => removeIxp(ixp.id)} className="text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className={labelCls}>{t.fields.ixpName}</label>
                    <input value={ixp.name} onChange={e => updateIxp(ixp.id, 'name', e.target.value)} placeholder="DE-CIX Frankfurt" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t.fields.ixpCity}</label>
                    <input value={ixp.city} onChange={e => updateIxp(ixp.id, 'city', e.target.value)} placeholder="Frankfurt, DE" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t.fields.ixpSpeeds}</label>
                    <input value={ixp.speeds} onChange={e => updateIxp(ixp.id, 'speeds', e.target.value)} placeholder="1G, 10G" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t.fields.ipv4}</label>
                    <input value={ixp.ipv4} onChange={e => updateIxp(ixp.id, 'ipv4', e.target.value)} placeholder="192.0.2.1" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{t.fields.ipv6}</label>
                    <input value={ixp.ipv6} onChange={e => updateIxp(ixp.id, 'ipv6', e.target.value)} placeholder="2001:db8::1" className={inputCls} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="font-semibold text-sm">{t.sections.contact}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t.fields.nocEmail}</label>
                <input value={fields.nocEmail ?? ''} onChange={e => set('nocEmail', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.nocPhone}</label>
                <input value={fields.nocPhone ?? ''} onChange={e => set('nocPhone', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t.fields.peeringEmail}</label>
                <input value={fields.peeringEmail ?? ''} onChange={e => set('peeringEmail', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t.fields.notes}</label>
              <textarea value={fields.notes ?? ''} onChange={e => set('notes', e.target.value)} rows={3}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full resize-none" />
            </div>
          </div>

          <button onClick={generate} className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-cyan-600 transition-colors">
            <FileText size={15} />{t.generate}
          </button>

          {output && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800">
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">{t.output}</span>
                <button onClick={copy} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-cyan-500 transition-colors">
                  {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>
              <pre className="px-6 py-5 text-xs font-mono text-zinc-300 whitespace-pre bg-zinc-950 dark:bg-black leading-relaxed overflow-x-auto">{output}</pre>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-cyan-500 transition-colors">Gabriel Mowses</a></span>
            <span>MIT License</span>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 mb-1">{t.references}</p>
            <ul className="space-y-0.5">
              {t.refList.map(ref => <li key={ref} className="text-xs text-zinc-400">{ref}</li>)}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
