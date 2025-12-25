"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, RotateCcw, QrCode, Download, RefreshCw, Calendar } from "lucide-react";
import QRCodeLib from "qrcode";
import { getLocalIP, replaceLocalhostWithIP } from "@/lib/get-local-ip";
import { logger } from "@/lib/logger";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/contexts/settings-context";
import { Lane } from "@/types/speed-data";
import { DateRangeMode } from "@/types/settings";
import { format } from "date-fns";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const UPDATE_INTERVALS = [
  { label: "1 seconde", value: 1000 },
  { label: "3 secondes", value: 3000 },
  { label: "5 secondes", value: 5000 },
  { label: "10 secondes", value: 10000 },
];

const MAX_DATA_POINTS_OPTIONS = [
  { label: "50 points", value: 50 },
  { label: "100 points", value: 100 },
  { label: "120 points", value: 120 },
  { label: "200 points", value: 200 },
];

interface SettingsPanelProps {
  availableSensors: string[];
}

export function SettingsPanel({ availableSensors }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [open, setOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [shareableUrl, setShareableUrl] = useState<string>("");
  const [localIP, setLocalIP] = useState<string>("");
  const [manualIP, setManualIP] = useState<string>("");
  const [isLoadingQR, setIsLoadingQR] = useState(true);

  // Generate QR code
  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(dataUrl);
    } catch (err) {
      logger.error("Error generating QR code:", err);
    }
  };

  // Get shareable URL and generate QR code
  const updateQRCode = useCallback(async () => {
    setIsLoadingQR(true);

    if (typeof window === "undefined") {
      setIsLoadingQR(false);
      return;
    }

    let url = window.location.href;

    // If manual IP is set, use it
    if (manualIP) {
      url = replaceLocalhostWithIP(url, manualIP);
      setShareableUrl(url);
      await generateQRCode(url);
      setIsLoadingQR(false);
      return;
    }

    // Otherwise, try to detect IP automatically
    const detectedIP = await getLocalIP();
    if (detectedIP) {
      setLocalIP(detectedIP);
      url = replaceLocalhostWithIP(url, detectedIP);
    }

    setShareableUrl(url);
    await generateQRCode(url);
    setIsLoadingQR(false);
  }, [manualIP]);

  // Generate QR code when component mounts or manual IP changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateQRCode();
  }, [updateQRCode]);

  const toggleSensor = (sensor: string) => {
    const newSensors = settings.selectedSensors.includes(sensor)
      ? settings.selectedSensors.filter((s) => s !== sensor)
      : [...settings.selectedSensors, sensor];
    updateSettings({ selectedSensors: newSensors });
  };

  const toggleLane = (lane: Lane) => {
    const newLanes = settings.selectedLanes.includes(lane)
      ? settings.selectedLanes.filter((l) => l !== lane)
      : [...settings.selectedLanes, lane];
    updateSettings({ selectedLanes: newLanes });
  };

  const isSensorSelected = (sensor: string) => {
    return settings.selectedSensors.length === 0 || settings.selectedSensors.includes(sensor);
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.href = qrCodeUrl;
      link.download = "race-board-qrcode.png";
      link.click();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres
          </SheetTitle>
          <SheetDescription>
            Configurez les options d&apos;affichage et de filtrage des données
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* QR Code Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">QR Code de partage</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={updateQRCode}
                disabled={isLoadingQR}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingQR ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Scannez ce code pour accéder au dashboard depuis un autre appareil
            </p>

            {/* Manual IP Input */}
            <div className="space-y-2">
              <Label htmlFor="manual-ip" className="text-xs">
                Adresse IP manuelle (optionnel)
              </Label>
              <div className="flex gap-2">
                <input
                  id="manual-ip"
                  type="text"
                  placeholder={localIP || "ex: 192.168.1.75"}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  value={manualIP}
                  onChange={(e) => setManualIP(e.target.value)}
                />
              </div>
              {localIP && !manualIP && (
                <p className="text-xs text-green-600">
                  ✓ IP détectée automatiquement: {localIP}
                </p>
              )}
            </div>

            {qrCodeUrl && !isLoadingQR && (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white rounded-lg border-2">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code pour accéder au dashboard"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground break-all px-2">
                  {shareableUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQRCode}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le QR Code
                </Button>
              </div>
            )}

            {isLoadingQR && (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Filtre de plage de dates */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">Période de données</h3>
            </div>
            <div className="space-y-3">
              <Select
                value={settings.dateRangeMode}
                onValueChange={(value: DateRangeMode) =>
                  updateSettings({ dateRangeMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Temps réel</SelectItem>
                  <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>

              {settings.dateRangeMode === "custom" && (
                <div className="space-y-3 pl-4 border-l-2">
                  <DateTimePicker
                    label="Date de début"
                    placeholder="Sélectionner la date de début"
                    date={settings.customStartDate ? new Date(settings.customStartDate) : undefined}
                    onDateChange={(date) => {
                      updateSettings({ customStartDate: date?.toISOString() || null });
                    }}
                  />
                  <DateTimePicker
                    label="Date de fin"
                    placeholder="Sélectionner la date de fin"
                    date={settings.customEndDate ? new Date(settings.customEndDate) : undefined}
                    onDateChange={(date) => {
                      updateSettings({ customEndDate: date?.toISOString() || null });
                    }}
                  />
                  {settings.customStartDate && settings.customEndDate && (
                    <div className="p-3 bg-primary/5 rounded-md">
                      <p className="text-xs text-muted-foreground">
                        📊 Les données seront chargées du{" "}
                        <span className="font-medium text-foreground">
                          {format(new Date(settings.customStartDate), "dd/MM/yyyy HH:mm")}
                        </span>{" "}
                        au{" "}
                        <span className="font-medium text-foreground">
                          {format(new Date(settings.customEndDate), "dd/MM/yyyy HH:mm")}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {settings.dateRangeMode === "realtime" && (
                <p className="text-xs text-muted-foreground">
                  Les dernières données en temps réel sont affichées
                </p>
              )}

              {settings.dateRangeMode === "today" && (
                <p className="text-xs text-muted-foreground">
                  Toutes les données d&apos;aujourd&apos;hui sont affichées
                </p>
              )}
            </div>
          </div>

          {/* Filtres de capteurs */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Capteurs</h3>
              {settings.selectedSensors.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSettings({ selectedSensors: [] })}
                >
                  Tout afficher
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sélectionnez les capteurs à afficher (vide = tous)
            </p>
            <div className="space-y-2">
              {availableSensors.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun capteur détecté. En attente de données...
                </p>
              ) : (
                availableSensors.map((sensor) => (
                  <div key={sensor} className="flex items-center justify-between">
                    <Label htmlFor={`sensor-${sensor}`} className="text-sm cursor-pointer">
                      {sensor}
                    </Label>
                    <Switch
                      id={`sensor-${sensor}`}
                      checked={isSensorSelected(sensor)}
                      onCheckedChange={() => toggleSensor(sensor)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Filtres de voies */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Voies</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lane-left" className="text-sm cursor-pointer">
                  Voie gauche
                </Label>
                <Switch
                  id="lane-left"
                  checked={settings.selectedLanes.includes(Lane.Left)}
                  onCheckedChange={() => toggleLane(Lane.Left)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="lane-right" className="text-sm cursor-pointer">
                  Voie droite
                </Label>
                <Switch
                  id="lane-right"
                  checked={settings.selectedLanes.includes(Lane.Right)}
                  onCheckedChange={() => toggleLane(Lane.Right)}
                />
              </div>
            </div>
          </div>

          {/* Intervalle de mise à jour */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Mise à jour des données</h3>
            <div className="space-y-2">
              <Label htmlFor="update-interval" className="text-sm">
                Intervalle de rafraîchissement
              </Label>
              <Select
                value={settings.updateInterval.toString()}
                onValueChange={(value) =>
                  updateSettings({ updateInterval: parseInt(value) })
                }
              >
                <SelectTrigger id="update-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPDATE_INTERVALS.map((interval) => (
                    <SelectItem key={interval.value} value={interval.value.toString()}>
                      {interval.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-data-points" className="text-sm">
                Nombre de points de données
              </Label>
              <Select
                value={settings.maxDataPoints.toString()}
                onValueChange={(value) =>
                  updateSettings({ maxDataPoints: parseInt(value) })
                }
              >
                <SelectTrigger id="max-data-points">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_DATA_POINTS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Affichage des composants */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Graphiques de base</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-chart" className="text-sm cursor-pointer">
                  Graphique de vitesses
                </Label>
                <Switch
                  id="show-chart"
                  checked={settings.showSpeedChart}
                  onCheckedChange={(checked) =>
                    updateSettings({ showSpeedChart: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-lane" className="text-sm cursor-pointer">
                  Distribution des voies
                </Label>
                <Switch
                  id="show-lane"
                  checked={settings.showLaneDistribution}
                  onCheckedChange={(checked) =>
                    updateSettings({ showLaneDistribution: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-sensor" className="text-sm cursor-pointer">
                  Statistiques des capteurs
                </Label>
                <Switch
                  id="show-sensor"
                  checked={settings.showSensorStats}
                  onCheckedChange={(checked) =>
                    updateSettings({ showSensorStats: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Analyses avancées */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Analyses avancées</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-hourly-trend" className="text-sm cursor-pointer">
                  Tendance horaire
                </Label>
                <Switch
                  id="show-hourly-trend"
                  checked={settings.showHourlyTrend}
                  onCheckedChange={(checked) =>
                    updateSettings({ showHourlyTrend: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-speed-records" className="text-sm cursor-pointer">
                  Records de vitesse
                </Label>
                <Switch
                  id="show-speed-records"
                  checked={settings.showSpeedRecords}
                  onCheckedChange={(checked) =>
                    updateSettings({ showSpeedRecords: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-speed-distribution" className="text-sm cursor-pointer">
                  Distribution des vitesses
                </Label>
                <Switch
                  id="show-speed-distribution"
                  checked={settings.showSpeedDistribution}
                  onCheckedChange={(checked) =>
                    updateSettings({ showSpeedDistribution: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-avg-sensor" className="text-sm cursor-pointer">
                  Vitesse moy. par capteur
                </Label>
                <Switch
                  id="show-avg-sensor"
                  checked={settings.showAverageSpeedBySensor}
                  onCheckedChange={(checked) =>
                    updateSettings({ showAverageSpeedBySensor: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-activity-heatmap" className="text-sm cursor-pointer">
                  Heatmap d&apos;activité
                </Label>
                <Switch
                  id="show-activity-heatmap"
                  checked={settings.showActivityHeatmap}
                  onCheckedChange={(checked) =>
                    updateSettings({ showActivityHeatmap: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-lane-performance" className="text-sm cursor-pointer">
                  Comparaison des corridors
                </Label>
                <Switch
                  id="show-lane-performance"
                  checked={settings.showLanePerformance}
                  onCheckedChange={(checked) =>
                    updateSettings({ showLanePerformance: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-speed-consistency" className="text-sm cursor-pointer">
                  Consistance des vitesses
                </Label>
                <Switch
                  id="show-speed-consistency"
                  checked={settings.showSpeedConsistency}
                  onCheckedChange={(checked) =>
                    updateSettings({ showSpeedConsistency: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-top-sensors" className="text-sm cursor-pointer">
                  Top capteurs actifs
                </Label>
                <Switch
                  id="show-top-sensors"
                  checked={settings.showTopSensors}
                  onCheckedChange={(checked) =>
                    updateSettings({ showTopSensors: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show-time-period" className="text-sm cursor-pointer">
                  Analyse par période
                </Label>
                <Switch
                  id="show-time-period"
                  checked={settings.showTimePeriodAnalysis}
                  onCheckedChange={(checked) =>
                    updateSettings({ showTimePeriodAnalysis: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Seuils d'alerte */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Alertes de vitesse</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-alerts" className="text-sm cursor-pointer">
                Activer les alertes
              </Label>
              <Switch
                id="enable-alerts"
                checked={settings.enableAlerts}
                onCheckedChange={(checked) =>
                  updateSettings({ enableAlerts: checked })
                }
              />
            </div>
            {settings.enableAlerts && (
              <div className="space-y-3 pl-4 border-l-2">
                <div className="space-y-1">
                  <Label htmlFor="speed-min" className="text-sm">
                    Vitesse minimale (km/h)
                  </Label>
                  <input
                    id="speed-min"
                    type="number"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={settings.speedThresholdMin}
                    onChange={(e) =>
                      updateSettings({
                        speedThresholdMin: parseInt(e.target.value) || 0,
                      })
                    }
                    min={0}
                    max={settings.speedThresholdMax - 1}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="speed-max" className="text-sm">
                    Vitesse maximale (km/h)
                  </Label>
                  <input
                    id="speed-max"
                    type="number"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    value={settings.speedThresholdMax}
                    onChange={(e) =>
                      updateSettings({
                        speedThresholdMax: parseInt(e.target.value) || 350,
                      })
                    }
                    min={settings.speedThresholdMin + 1}
                    max={500}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bouton de réinitialisation */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                resetSettings();
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser les paramètres
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
