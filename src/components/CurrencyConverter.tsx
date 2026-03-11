import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowRightLeft, Copy, Check, RotateCcw, Info, Settings, 
  ChevronDown, Banknote, Euro 
} from "lucide-react";
import { toast } from "sonner";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState("10.85");
  const [commissionRate, setCommissionRate] = useState("1.5");
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const rate = parseFloat(exchangeRate) || 0;
  const commission = parseFloat(commissionRate) || 0;
  const madAmount = parseFloat(amount) || 0;

  const result = useMemo(() => {
    if (!madAmount || !rate) return null;
    const baseEur = madAmount / rate;
    const commissionAmount = baseEur * (commission / 100);
    const finalEur = baseEur + commissionAmount;
    return { baseEur, commissionAmount, finalEur };
  }, [madAmount, rate, commission]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.finalEur.toFixed(2));
    setCopied(true);
    toast.success("Résultat copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAmount("");
    setExchangeRate("10.85");
    setCommissionRate("1.5");
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, "").replace(",", ".");
    setAmount(sanitized);
  };

  const formatEur = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);

  const formatMad = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD", minimumFractionDigits: 2 }).format(n);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Convertisseur MAD → EUR
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Conversion avec commission de {commissionRate} %
        </p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-lg shadow-lg border-border/60 animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Banknote className="w-5 h-5 text-accent" />
            Montant en Dirhams
          </CardTitle>
          <CardDescription>
            Taux : 1 EUR = {exchangeRate} MAD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="mad-amount">Montant (MAD)</Label>
            <div className="relative">
              <Input
                id="mad-amount"
                type="text"
                inputMode="decimal"
                placeholder="Ex : 5 000"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pr-16 text-lg h-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                MAD
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => {}}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!madAmount || !rate}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Convertir
            </Button>
            <Button variant="outline" onClick={handleReset} className="h-11">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl bg-secondary/50 border border-border p-5 space-y-3">
                {/* Final amount */}
                <div className="text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Montant final
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Euro className="w-7 h-7 text-accent" />
                    <span className="text-4xl font-bold text-foreground tracking-tight">
                      {result.finalEur.toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground">EUR</span>
                  </div>
                </div>

                {/* Copy button */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copied ? "Copié" : "Copier"}
                  </Button>
                </div>
              </div>

              {/* Breakdown */}
              <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                <p className="font-semibold text-foreground mb-2">Détail du calcul</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>Montant</span>
                  <span>{formatMad(madAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Conversion de base</span>
                  <span>{formatEur(result.baseEur)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground items-center">
                  <span className="flex items-center gap-1">
                    Commission ({commissionRate} %)
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          La commission de {commissionRate} % est ajoutée au montant
                          converti pour couvrir les frais de service.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="text-accent font-medium">+ {formatEur(result.commissionAmount)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatEur(result.finalEur)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Settings */}
          <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground text-sm h-9">
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Paramètres avancés
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`} />
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
                  onChange={(e) => setExchangeRate(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission-rate">Taux de commission (%)</Label>
                <Input
                  id="commission-rate"
                  type="text"
                  inputMode="decimal"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value.replace(/[^0-9.]/g, ""))}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Taux indicatif · Les résultats sont fournis à titre informatif uniquement.
      </p>
    </div>
  );
};

export default CurrencyConverter;
