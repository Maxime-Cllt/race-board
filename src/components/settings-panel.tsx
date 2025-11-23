"use client";

import { useState } from "react";
import { Settings, X, RotateCcw } from "lucide-react";
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

const AVAILABLE_SENSORS = [
  "Sector 1 Entry",
  "Sector 1 Exit",
  "Sector 2 Entry",
  "Sector 2 Exit",
  "Sector 3 Entry",
  "Sector 3 Exit",
  "Finish Line",
  "Pit Entry",
];

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

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [open, setOpen] = useState(false);

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
          {/* Filtres de capteurs */}
          <div className="space-y-4">
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
              {AVAILABLE_SENSORS.map((sensor) => (
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
              ))}
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
            <h3 className="text-sm font-semibold">Composants à afficher</h3>
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
