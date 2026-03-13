import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Wallet, ArrowDown, Copy, Check, RotateCcw, Info, Settings, ChevronDown, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("10.85");
  const [commissionRate, setCommissionRate] = useState("3");
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateTimestamp, setRateTimestamp] = useState<string | null>(null);
  const [isLiveRate, setIsLiveRate] = useState(false);

  const fetchLiveRate = async () => {
    setRateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-exchange-rate');
      if (error) throw error;
      if (data?.success && data.rate) {
        setExchangeRate(parseFloat(data.rate).toFixed(4));
        setRateTimestamp(data.timestamp);
        setIsLiveRate(true);
        toast.success("Taux de change mis à jour !");
      } else {
        throw new Error(data?.error || "Erreur inconnue");
      }
    } catch (err) {
      console.error("Failed to fetch rate:", err);
      toast.error("Impossible de récupérer le taux. Utilisation du taux par défaut.");
    } finally {
      setRateLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRate();
  }, []);

  const rate = parseFloat(exchangeRate) || 0;
  const commission = parseFloat(commissionRate) || 0;
  const madAmount = parseFloat(amount) || 0;

  const result = useMemo(() => {
    if (!madAmount || !rate) return null;
    const baseEur = madAmount / rate;
    const eurToSend = baseEur / (1 - commission / 100);
    const fees = eurToSend - baseEur;
    return { baseEur, eurToSend, fees };
  }, [madAmount, rate, commission]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.eurToSend.toFixed(2));
    setCopied(true);
    toast.success("Montant copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAmount("");
    setCommissionRate("1.5");
    fetchLiveRate();
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    setAmount(sanitized);
  };

  const fmt = (n: number, currency: string) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Convertisseur Facture MAD → EUR
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Sté AGOUIM · Calculez le montant exact à réclamer pour recevoir votre facture nette
        </p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-lg shadow-xl border-border/40 rounded-2xl animate-fade-in">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Rate badge */}
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
              {isLiveRate && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              )}
              Taux : 1 EUR = {exchangeRate} MAD · Commission : {commissionRate} %
            </div>
            <div className="flex items-center gap-2">
              {rateTimestamp && (
                <span className="text-[10px] text-muted-foreground/60">
                  Mis à jour : {new Date(rateTimestamp).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchLiveRate}
                disabled={rateLoading}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${rateLoading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="mad-amount" className="text-sm font-semibold">
              Montant de la Facture (MAD)
            </Label>
            <div className="relative">
              <Input
                id="mad-amount"
                type="text"
                inputMode="decimal"
                placeholder="Ex : 19 831"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pr-16 text-lg h-14 rounded-xl border-border bg-secondary/40 focus:bg-card"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                MAD
              </span>
            </div>
          </div>

          {/* Arrow */}
          {madAmount > 0 && (
            <div className="flex justify-center animate-fade-in">
              <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                <ArrowDown className="w-4 h-4 text-accent" />
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-2xl bg-primary p-6 text-center space-y-2">
                <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-widest">
                  Montant à réclamer
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-primary-foreground tracking-tight">
                    {result.eurToSend.toFixed(2)}
                  </span>
                  <span className="text-lg font-semibold text-primary-foreground/70">EUR</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 mt-1"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copié" : "Copier le montant"}
                </Button>
              </div>

              {/* Breakdown */}
              <div className="rounded-xl border border-border p-4 space-y-2.5 text-sm">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  Décomposition
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Cette marge de sécurité garantit la réception du montant total de votre facture après frais bancaires.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </p>
                <div className="flex justify-between text-muted-foreground">
                  <span>Montant net souhaité</span>
                  <span>{fmt(madAmount, "MAD")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Équivalent de base</span>
                  <span>{fmt(result.baseEur, "EUR")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Frais estimés ({commissionRate} %)</span>
                  <span className="text-accent font-medium">+ {fmt(result.fees, "EUR")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taux appliqué</span>
                  <span>1 EUR = {exchangeRate} MAD</span>
                </div>
                <div className="border-t border-border pt-2.5 flex justify-between font-semibold text-foreground">
                  <span>Total à réclamer</span>
                  <span>{fmt(result.eurToSend, "EUR")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleReset} className="h-11 rounded-xl">
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>

          {/* Settings */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground text-sm h-9"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exchange-rate">Taux de change (1 EUR = ? MAD)</Label>
                <Input
                  id="exchange-rate"
                  type="text"
                  inputMode="decimal"
                  value={exchangeRate}
                  onChange={(e) => {
                    setExchangeRate(e.target.value.replace(/[^0-9.]/g, ""));
                    setIsLiveRate(false);
                  }}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission-rate">Marge de sécurité (%)</Label>
                <Input
                  id="commission-rate"
                  type="text"
                  inputMode="decimal"
                  value={commissionRate}
                  onChange={(e) =>
                    setCommissionRate(e.target.value.replace(/[^0-9.]/g, ""))
                  }
                  className="rounded-xl"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center max-w-md">
        Les résultats sont fournis à titre indicatif. La marge de sécurité compense les écarts de change et frais bancaires.
      </p>
    </div>
  );
};

export default CurrencyConverter;
