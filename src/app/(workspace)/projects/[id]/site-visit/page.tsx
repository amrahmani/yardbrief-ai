"use client";

import Image from "next/image";
import { useState } from "react";

import { useWorkspaceData } from "@/components/providers/workspace-data-provider";
import { useCurrentProject } from "@/components/projects/project-context";
import { SectionCard } from "@/components/ui/section-card";
import { transcribeVoiceNotePlaceholder } from "@/lib/ai/transcribeVoiceNote";
import { createEmptySiteVisitForm } from "@/lib/project-store";
import {
  applySiteVisitFormToProject,
  normalizeSiteVisitStage,
  type UploadedPhotoDraft,
} from "@/lib/site-visit-form";
import type {
  Project,
  ProjectStage,
  SitePhotoType,
  SiteVisitFormData,
} from "@/types/yardbrief";

const siteVisitStageOptions: ProjectStage[] = [
  "First visit",
  "Quote preparation",
  "Work in progress",
  "Completed",
  "Follow-up",
];

const sitePhotoTypeOptions: SitePhotoType[] = [
  "Before",
  "After",
  "Issue",
  "Access",
  "Drainage",
  "Plant/lawn condition",
  "Other",
];

function buildInitialForm(project: Project): SiteVisitFormData {
  const existing = project.siteVisit.form;
  const observations = project.siteVisit.observations;
  const getObservation = (label: string) =>
    observations.find((item) => item.label.toLowerCase() === label.toLowerCase())?.value ?? "";

  if (existing) {
    return {
      ...existing,
      projectStage: normalizeSiteVisitStage(existing.projectStage),
      voiceNoteFileName: existing.voiceNoteFileName ?? "",
      voiceNoteFileType: existing.voiceNoteFileType ?? "",
    };
  }

  const base = createEmptySiteVisitForm(normalizeSiteVisitStage(project.stage));

  return {
    ...base,
    visitDate: project.siteVisit.scheduledFor === "Not scheduled yet" ? "" : project.siteVisit.scheduledFor,
    clientRequirements: {
      mainClientGoals: project.goals.join("\n"),
      preferredOutdoorStyle: "",
      budgetRange: project.budgetRange === "Not set" ? "" : project.budgetRange,
      priorityAreas: project.tags.join(", "),
      mustKeepItems: "",
      mustAvoidItems: "",
    },
    siteConditions: {
      accessConstraints: project.siteVisit.constraints[0] ?? "",
      drainageNotes: getObservation("Drainage"),
      slopeNotes: getObservation("Slope"),
      shadeSunNotes: getObservation("Sun") || getObservation("Shade"),
      soilLawnConditionNotes: "",
      petsChildrenConsiderations: "",
      existingIssues: project.siteVisit.constraints.slice(1).join("\n"),
    },
    workNotes: {
      requiredWork: project.deliverables.join("\n"),
      exclusions: "",
      sitePreparationNeeded: "",
      materialsToBeConfirmed: "",
      clientResponsibilities: "",
    },
    roughNote: project.notes === "No notes added yet." ? "" : project.notes,
  };
}

const acceptedAudioExtensions = [".mp3", ".m4a", ".wav"];

function createPhotoDraftId(fileName: string, index: number) {
  const cleanName =
    fileName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "photo";

  return `${cleanName}-${index}-${Date.now().toString(36)}`;
}

function buildInitialUploadedPhotos(project: Project): UploadedPhotoDraft[] {
  return project.siteVisit.photos
    .filter((photo) => photo.label !== "Photo upload placeholder")
    .map((photo, index) => ({
      id: `saved-photo-${index}`,
      fileName: photo.fileName ?? photo.label,
      caption: photo.caption,
      photoType: photo.photoType ?? "Other",
      previewUrl: photo.previewUrl ?? "",
    }));
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unsupported file preview."));
    };

    reader.onerror = () => {
      reject(new Error("Preview could not be created."));
    };

    reader.readAsDataURL(file);
  });
}

export default function SiteVisitPage() {
  const { project } = useCurrentProject();

  if (!project) {
    return null;
  }

  return <SiteVisitFormContent key={`${project.id}-${project.lastUpdated}`} project={project} />;
}

function SiteVisitFormContent({ project }: { project: Project }) {
  const { mode, saveProject } = useWorkspaceData();
  const [form, setForm] = useState<SiteVisitFormData>(() => buildInitialForm(project));
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhotoDraft[]>(() =>
    buildInitialUploadedPhotos(project),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [voiceNoteMessage, setVoiceNoteMessage] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");

  function updateField<
    TSection extends "clientRequirements" | "siteConditions" | "workNotes",
    TKey extends keyof SiteVisitFormData[TSection],
  >(section: TSection, key: TKey, value: string) {
    setForm((current) =>
      current
        ? {
            ...current,
            [section]: {
              ...current[section],
              [key]: value,
            },
          }
        : current,
    );
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    const updatedProject = applySiteVisitFormToProject({
      form,
      now: new Date(),
      project,
      uploadedPhotos,
    });

    try {
      await saveProject(updatedProject);
      setSaveMessage(
        mode === "cloud"
          ? "Site visit saved to Supabase for this signed-in workspace."
          : "Site visit saved to local project state.",
      );
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Site visit could not be saved right now.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAudioUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

    if (!acceptedAudioExtensions.includes(extension)) {
      setVoiceNoteMessage("Please upload an .mp3, .m4a, or .wav file.");
      event.target.value = "";
      return;
    }

    setForm((current) =>
      current
        ? {
            ...current,
            voiceNoteFileName: file.name,
            voiceNoteFileType: file.type || extension,
          }
        : current,
    );

    const placeholderResult = await transcribeVoiceNotePlaceholder(file.name);
    setVoiceNoteMessage(placeholderResult.message);
    event.target.value = "";
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    if (files.some((file) => !isImageFile(file))) {
      setPhotoMessage("Please upload image files only for photo preview.");
      event.target.value = "";
      return;
    }

    try {
      const nextPhotos = await Promise.all(
        files.map(async (file, index) => ({
          id: createPhotoDraftId(file.name, index),
          fileName: file.name,
          caption: "",
          photoType: "Other" as SitePhotoType,
          previewUrl: await readFileAsDataUrl(file),
        })),
      );

      setUploadedPhotos((current) => [...current, ...nextPhotos]);
      setPhotoMessage(
        `${nextPhotos.length} photo${nextPhotos.length === 1 ? "" : "s"} added for local preview only.`,
      );
    } catch {
      setPhotoMessage("Preview could not be prepared for one or more photos. Please try again.");
    }

    event.target.value = "";
  }

  function updatePhotoCaption(id: string, caption: string) {
    setUploadedPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, caption } : photo)),
    );
  }

  function updatePhotoType(id: string, photoType: SitePhotoType) {
    setUploadedPhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, photoType } : photo)),
    );
  }

  function removePhoto(id: string) {
    setUploadedPhotos((current) => current.filter((photo) => photo.id !== id));
    setPhotoMessage("Photo removed from this local preview list.");
  }

  const fieldClass = "yb-field mt-2";
  const textareaClass = "yb-field yb-textarea mt-2 min-h-28";

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
              Site visit input
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-charcoal sm:text-5xl">
              Capture the visit in a structured way.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone sm:text-base">
              Save client requirements, field observations, work notes, and rough transcription
              into local project state so it is ready for the next report.
            </p>
          </div>
          {saveMessage ? (
            <div className="rounded-full bg-forest/8 px-4 py-2 text-sm font-semibold text-forest">
              {saveMessage}
            </div>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            "Use client nicknames instead of full identities.",
            "Keep location to suburb or area only.",
            "Review photos and exports before sharing.",
          ].map((item) => (
            <div key={item} className="yb-meta-tile bg-white/82 text-sm leading-7 text-stone">
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <form className="space-y-6" onSubmit={handleSave}>
        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            1. Visit details
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Visit date</span>
              <input
                type="text"
                value={form.visitDate}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, visitDate: event.target.value } : current,
                  )
                }
                placeholder="Tuesday, 12 May 2026"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Project stage</span>
              <select
                value={form.projectStage}
                onChange={(event) =>
                  setForm((current) =>
                    current
                      ? {
                          ...current,
                          projectStage: event.target.value as ProjectStage,
                        }
                      : current,
                  )
                }
                className={fieldClass}
              >
                {siteVisitStageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            2. Client requirements
          </p>
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Main client goals</span>
              <textarea
                value={form.clientRequirements.mainClientGoals}
                onChange={(event) =>
                  updateField(
                    "clientRequirements",
                    "mainClientGoals",
                    event.target.value,
                  )
                }
                rows={4}
                placeholder="What does the client most want to achieve?"
                className={textareaClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">
                  Preferred outdoor style
                </span>
                <input
                  type="text"
                  value={form.clientRequirements.preferredOutdoorStyle}
                  onChange={(event) =>
                    updateField(
                      "clientRequirements",
                      "preferredOutdoorStyle",
                      event.target.value,
                    )
                  }
                  placeholder="Modern native, lush courtyard, resort-inspired..."
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Budget range</span>
                <input
                  type="text"
                  value={form.clientRequirements.budgetRange}
                  onChange={(event) =>
                    updateField(
                      "clientRequirements",
                      "budgetRange",
                      event.target.value,
                    )
                  }
                  placeholder="$20k - $35k"
                  className={fieldClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Priority areas</span>
              <textarea
                value={form.clientRequirements.priorityAreas}
                onChange={(event) =>
                  updateField(
                    "clientRequirements",
                    "priorityAreas",
                    event.target.value,
                  )
                }
                rows={3}
                placeholder="Front entry, backyard entertaining zone, side path..."
                className={textareaClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Must-keep items</span>
                <textarea
                  value={form.clientRequirements.mustKeepItems}
                  onChange={(event) =>
                    updateField(
                      "clientRequirements",
                      "mustKeepItems",
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Trees, paving, existing pots, irrigation..."
                  className={textareaClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Must-avoid items</span>
                <textarea
                  value={form.clientRequirements.mustAvoidItems}
                  onChange={(event) =>
                    updateField(
                      "clientRequirements",
                      "mustAvoidItems",
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="High-maintenance planting, demolition, synthetic turf..."
                  className={textareaClass}
                />
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            3. Site conditions
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Access constraints</span>
              <textarea
                value={form.siteConditions.accessConstraints}
                onChange={(event) =>
                  updateField("siteConditions", "accessConstraints", event.target.value)
                }
                rows={3}
                className={textareaClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Drainage notes</span>
              <textarea
                value={form.siteConditions.drainageNotes}
                onChange={(event) =>
                  updateField("siteConditions", "drainageNotes", event.target.value)
                }
                rows={3}
                className={textareaClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Slope notes</span>
              <textarea
                value={form.siteConditions.slopeNotes}
                onChange={(event) =>
                  updateField("siteConditions", "slopeNotes", event.target.value)
                }
                rows={3}
                className={textareaClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Shade/sun notes</span>
              <textarea
                value={form.siteConditions.shadeSunNotes}
                onChange={(event) =>
                  updateField("siteConditions", "shadeSunNotes", event.target.value)
                }
                rows={3}
                className={textareaClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">
                Soil/lawn condition notes
              </span>
              <textarea
                value={form.siteConditions.soilLawnConditionNotes}
                onChange={(event) =>
                  updateField(
                    "siteConditions",
                    "soilLawnConditionNotes",
                    event.target.value,
                  )
                }
                rows={3}
                className={textareaClass}
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">
                Pets/children considerations
              </span>
              <textarea
                value={form.siteConditions.petsChildrenConsiderations}
                onChange={(event) =>
                  updateField(
                    "siteConditions",
                    "petsChildrenConsiderations",
                    event.target.value,
                  )
                }
                rows={3}
                className={textareaClass}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-charcoal">Existing issues</span>
              <textarea
                value={form.siteConditions.existingIssues}
                onChange={(event) =>
                  updateField("siteConditions", "existingIssues", event.target.value)
                }
                rows={4}
                className={textareaClass}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            4. Work notes
          </p>
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Required work</span>
              <textarea
                value={form.workNotes.requiredWork}
                onChange={(event) =>
                  updateField("workNotes", "requiredWork", event.target.value)
                }
                rows={4}
                className={textareaClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">Exclusions</span>
                <textarea
                  value={form.workNotes.exclusions}
                  onChange={(event) =>
                    updateField("workNotes", "exclusions", event.target.value)
                  }
                  rows={3}
                  className={textareaClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">
                  Site preparation needed
                </span>
                <textarea
                  value={form.workNotes.sitePreparationNeeded}
                  onChange={(event) =>
                    updateField(
                      "workNotes",
                      "sitePreparationNeeded",
                      event.target.value,
                    )
                  }
                  rows={3}
                  className={textareaClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">
                  Materials to be confirmed
                </span>
                <textarea
                  value={form.workNotes.materialsToBeConfirmed}
                  onChange={(event) =>
                    updateField(
                      "workNotes",
                      "materialsToBeConfirmed",
                      event.target.value,
                    )
                  }
                  rows={3}
                  className={textareaClass}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-charcoal">
                  Client responsibilities
                </span>
                <textarea
                  value={form.workNotes.clientResponsibilities}
                  onChange={(event) =>
                    updateField(
                      "workNotes",
                      "clientResponsibilities",
                      event.target.value,
                    )
                  }
                  rows={3}
                  className={textareaClass}
                />
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            5. Voice note and rough note
          </p>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Audio upload</span>
              <input
                type="file"
                accept={acceptedAudioExtensions.join(",")}
                onChange={handleAudioUpload}
                className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
              />
              <p className="mt-2 text-sm leading-7 text-stone">
                Upload a voice note in .mp3, .m4a, or .wav format. Live microphone recording is
                not required in this MVP.
              </p>
            </label>

            <div className="rounded-[1.6rem] border border-charcoal/8 bg-beige/45 px-4 py-4">
              <p className="text-sm font-semibold text-charcoal">Uploaded voice note</p>
              <p className="mt-2 text-sm leading-7 text-stone">
                {form.voiceNoteFileName
                  ? `${form.voiceNoteFileName} (${form.voiceNoteFileType || "audio"})`
                  : "No audio file selected yet."}
              </p>
              <p className="mt-2 text-sm leading-7 text-stone">
                Automatic transcription coming soon.
              </p>
              {voiceNoteMessage ? <p className="mt-2 text-sm font-medium text-forest">{voiceNoteMessage}</p> : null}
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-charcoal">
                Manual transcript or rough notes
              </span>
              <textarea
                value={form.roughNote}
                onChange={(event) =>
                  setForm((current) =>
                    current ? { ...current, roughNote: event.target.value } : current,
                  )
                }
                rows={8}
                placeholder="Paste transcribed text manually, or add rough dictation and field notes here."
                className={`${textareaClass} mt-2 min-h-44`}
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard className="bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(243,234,219,0.76))]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone">
            6. Photos
          </p>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-charcoal">Upload photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className={`${fieldClass} file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white`}
              />
              <p className="mt-2 text-sm leading-7 text-stone">
                Photos stay local to this browser in this MVP. They are not uploaded to cloud
                storage.
              </p>
            </label>

            <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50/80 px-4 py-4">
              <p className="text-sm font-semibold text-charcoal">Privacy review before upload</p>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-stone">
                <li>Avoid including people&apos;s faces where possible.</li>
                <li>Avoid exact address signs.</li>
                <li>Review photos before exporting.</li>
                <li>Image redaction will be added later.</li>
              </ul>
            </div>

            {photoMessage ? (
              <div className="rounded-[1.4rem] bg-forest/8 px-4 py-3 text-sm font-medium text-forest">
                {photoMessage}
              </div>
            ) : null}

            {uploadedPhotos.length > 0 ? (
              <div className="grid gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="rounded-[1.8rem] border border-charcoal/10 bg-white/92 p-4 shadow-[0_18px_50px_rgba(37,44,34,0.08)]"
                  >
                    <div className="overflow-hidden rounded-[1.3rem] border border-charcoal/8 bg-beige/35">
                      {photo.previewUrl ? (
                        <Image
                          src={photo.previewUrl}
                          alt={photo.caption.trim() || photo.fileName}
                          width={960}
                          height={720}
                          unoptimized
                          className="h-52 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-52 items-center justify-center px-6 text-center text-sm leading-7 text-stone">
                          Preview available only in this browser. Re-upload the image if you need
                          to review it again later.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-charcoal">Photo {index + 1}</p>
                        <p className="mt-1 break-all text-xs leading-6 text-stone">
                          {photo.fileName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="rounded-full border border-charcoal/12 px-3 py-1.5 text-xs font-semibold text-charcoal transition hover:border-charcoal/24 hover:bg-charcoal/4"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="text-sm font-semibold text-charcoal">Caption</span>
                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(event) => updatePhotoCaption(photo.id, event.target.value)}
                          placeholder="Front boundary drainage issue beside the driveway."
                          className={fieldClass}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-charcoal">Photo type</span>
                        <select
                          value={photo.photoType}
                          onChange={(event) =>
                            updatePhotoType(photo.id, event.target.value as SitePhotoType)
                          }
                          className={fieldClass}
                        >
                          {sitePhotoTypeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="rounded-[1.4rem] border border-charcoal/8 bg-beige/35 px-4 py-4 text-sm leading-7 text-stone">
                        Stored locally for preview only. Cloud storage and image redaction are not
                        enabled in this MVP.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.8rem] border border-dashed border-charcoal/16 bg-white/85 px-5 py-8 text-center">
                <div className="mx-auto max-w-md space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-beige text-xl font-semibold text-charcoal">
                    +
                  </div>
                  <p className="text-base font-semibold text-charcoal">Add local photo previews</p>
                  <p className="text-sm leading-7 text-stone">
                    Upload site photos, tag each one, and add captions before saving the visit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSaving}
            className="yb-button yb-button-primary w-full sm:w-auto"
          >
            {isSaving ? "Saving site visit..." : "Save Site Visit"}
          </button>
          <div className="inline-flex items-center rounded-full bg-white px-4 py-3 text-sm text-stone">
            {mode === "cloud"
              ? "Saved to your Supabase workspace."
              : "Saved locally for this browser only."}
          </div>
        </div>
      </form>
    </div>
  );
}
