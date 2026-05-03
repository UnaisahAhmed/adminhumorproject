export type AdminFieldType = "boolean" | "number" | "text" | "textarea" | "uuid";

export type AdminField = {
  name: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  readOnly?: boolean;
};

export type AdminColumnType = "preview" | "value";

export type AdminColumn = {
  name: string;
  label: string;
  type?: AdminColumnType;
};

export type AdminTableConfig = {
  key: string;
  title: string;
  description: string;
  table: string;
  primaryKey: string;
  columns: string[];
  displayColumns?: AdminColumn[];
  fields: AdminField[];
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  orderBy?: string;
};

const auditColumns = [
  "created_datetime_utc",
  "modified_datetime_utc",
  "created_by_user_id",
  "modified_by_user_id",
];

export const adminTableConfigs = {
  profiles: {
    key: "profiles",
    title: "Profiles",
    description: "Read users and admin capability flags.",
    table: "profiles",
    primaryKey: "id",
    columns: ["id", "email", "first_name", "last_name", "is_superadmin", "is_in_study", "is_matrix_admin", ...auditColumns],
    fields: [],
    orderBy: "created_datetime_utc",
  },
  captions: {
    key: "captions",
    title: "Captions",
    description: "Read generated captions and their lineage metadata.",
    table: "captions",
    primaryKey: "id",
    columns: ["id", "content", "is_public", "is_featured", "like_count", "profile_id", "image_id", "humor_flavor_id", "caption_request_id", "llm_prompt_chain_id", ...auditColumns],
    fields: [],
    orderBy: "created_datetime_utc",
  },
  images: {
    key: "images",
    title: "Images",
    description: "Create, read, update, and delete image metadata rows.",
    table: "images",
    primaryKey: "id",
    columns: ["id", "url", "is_common_use", "is_public", "profile_id", "additional_context", "image_description", "celebrity_recognition", ...auditColumns],
    displayColumns: [
      { name: "url", label: "Preview", type: "preview" },
      { name: "id", label: "ID" },
      { name: "profile_id", label: "Profile ID" },
      { name: "is_public", label: "Public" },
      { name: "is_common_use", label: "Common Use" },
      { name: "created_datetime_utc", label: "Created" },
    ],
    fields: [
      { name: "url", label: "Image URL", type: "text", required: true },
      { name: "is_common_use", label: "Common-use image", type: "boolean" },
      { name: "is_public", label: "Public image", type: "boolean" },
      { name: "profile_id", label: "Profile ID", type: "uuid" },
      { name: "additional_context", label: "Additional context", type: "textarea" },
      { name: "image_description", label: "Image description", type: "textarea" },
      { name: "celebrity_recognition", label: "Celebrity recognition", type: "textarea" },
    ],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    orderBy: "created_datetime_utc",
  },
  "caption-requests": {
    key: "caption-requests",
    title: "Caption Requests",
    description: "Read image caption generation requests.",
    table: "caption_requests",
    primaryKey: "id",
    columns: ["id", "profile_id", "image_id", ...auditColumns],
    fields: [],
    orderBy: "created_datetime_utc",
  },
  "caption-examples": {
    key: "caption-examples",
    title: "Caption Examples",
    description: "Create and maintain examples used for caption guidance.",
    table: "caption_examples",
    primaryKey: "id",
    columns: ["id", "image_description", "caption", "explanation", "priority", "image_id", ...auditColumns],
    fields: [
      { name: "image_description", label: "Image description", type: "textarea", required: true },
      { name: "caption", label: "Caption", type: "textarea", required: true },
      { name: "explanation", label: "Explanation", type: "textarea", required: true },
      { name: "priority", label: "Priority", type: "number" },
      { name: "image_id", label: "Image ID", type: "uuid" },
    ],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    orderBy: "created_datetime_utc",
  },
  "humor-flavors": {
    key: "humor-flavors",
    title: "Humor Flavors",
    description: "Read reusable humor strategies and pinned status.",
    table: "humor_flavors",
    primaryKey: "id",
    columns: ["id", "slug", "description", "is_pinned", ...auditColumns],
    fields: [],
    orderBy: "created_datetime_utc",
  },
  "humor-flavor-steps": {
    key: "humor-flavor-steps",
    title: "Humor Flavor Steps",
    description: "Read ordered prompt-engineering steps behind each humor flavor.",
    table: "humor_flavor_steps",
    primaryKey: "id",
    columns: ["id", "humor_flavor_id", "order_by", "humor_flavor_step_type_id", "llm_model_id", "llm_temperature", "llm_input_type_id", "llm_output_type_id", "description", "llm_system_prompt", "llm_user_prompt", ...auditColumns],
    fields: [],
    orderBy: "created_datetime_utc",
  },
  "humor-flavor-mix": {
    key: "humor-flavor-mix",
    title: "Humor Flavor Mix",
    description: "Read and update how many captions each flavor should contribute.",
    table: "humor_flavor_mix",
    primaryKey: "id",
    columns: ["id", "humor_flavor_id", "caption_count", ...auditColumns],
    fields: [
      { name: "humor_flavor_id", label: "Humor flavor ID", type: "number", required: true },
      { name: "caption_count", label: "Caption count", type: "number", required: true },
    ],
    canUpdate: true,
    orderBy: "created_datetime_utc",
  },
  terms: {
    key: "terms",
    title: "Terms",
    description: "Create and maintain vocabulary terms used by the system.",
    table: "terms",
    primaryKey: "id",
    columns: ["id", "term", "definition", "example", "priority", "term_type_id", ...auditColumns],
    fields: [
      { name: "term", label: "Term", type: "text", required: true },
      { name: "definition", label: "Definition", type: "textarea", required: true },
      { name: "example", label: "Example", type: "textarea", required: true },
      { name: "priority", label: "Priority", type: "number" },
      { name: "term_type_id", label: "Term type ID", type: "number" },
    ],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    orderBy: "created_datetime_utc",
  },
  "llm-providers": {
    key: "llm-providers",
    title: "LLM Providers",
    description: "Create and maintain model provider records.",
    table: "llm_providers",
    primaryKey: "id",
    columns: ["id", "name", ...auditColumns],
    fields: [{ name: "name", label: "Name", type: "text", required: true }],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    orderBy: "created_datetime_utc",
  },
  "llm-models": {
    key: "llm-models",
    title: "LLM Models",
    description: "Create and maintain models available to humor generation.",
    table: "llm_models",
    primaryKey: "id",
    columns: ["id", "name", "llm_provider_id", "provider_model_id", "is_temperature_supported", ...auditColumns],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "llm_provider_id", label: "LLM provider ID", type: "number", required: true },
      { name: "provider_model_id", label: "Provider model ID", type: "text", required: true },
      { name: "is_temperature_supported", label: "Temperature supported", type: "boolean" },
    ],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    orderBy: "created_datetime_utc",
  },
  "llm-prompt-chains": {
    key: "llm-prompt-chains",
    title: "LLM Prompt Chains",
    description: "Read prompt chain records linked to caption requests.",
    table: "llm_prompt_chains",
    primaryKey: "id",
    columns: ["id", "caption_request_id", ...auditColumns],
    fields: [],
    orderBy: "created_datetime_utc",
  },
  "llm-model-responses": {
    key: "llm-model-responses",
    title: "LLM Model Responses",
    description: "Read low-level execution logs for generated responses.",
    table: "llm_model_responses",
    primaryKey: "id",
    columns: ["id", "llm_model_id", "humor_flavor_id", "caption_request_id", "profile_id", "processing_time_seconds", "llm_temperature", "llm_model_response", "llm_system_prompt", "llm_user_prompt", ...auditColumns],
    fields: [],
    orderBy: "created_datetime_utc",
  },
  "allowed-signup-domains": {
    key: "allowed-signup-domains",
    title: "Allowed Signup Domains",
    description: "Create and maintain apex domains allowed to sign up.",
    table: "allowed_signup_domains",
    primaryKey: "id",
    columns: ["id", "apex_domain", ...auditColumns],
    fields: [{ name: "apex_domain", label: "Apex domain", type: "text", required: true }],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    orderBy: "created_datetime_utc",
  },
  "whitelist-emails": {
    key: "whitelist-emails",
    title: "Whitelisted Email Addresses",
    description: "Create and maintain individual email addresses allowed to sign up.",
    table: "whitelist_email_addresses",
    primaryKey: "id",
    columns: ["id", "email_address", ...auditColumns],
    fields: [{ name: "email_address", label: "Email address", type: "text", required: true }],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    orderBy: "created_datetime_utc",
  },
} satisfies Record<string, AdminTableConfig>;

export type AdminSectionKey = keyof typeof adminTableConfigs;

export function getAdminTableConfig(key: string) {
  return adminTableConfigs[key as AdminSectionKey] as AdminTableConfig | undefined;
}

export const adminNavGroups = [
  {
    title: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    title: "People & Access",
    links: [
      { href: "/admin/profiles", label: "Profiles" },
      { href: "/admin/allowed-signup-domains", label: "Signup Domains" },
      { href: "/admin/whitelist-emails", label: "Whitelist Emails" },
    ],
  },
  {
    title: "Images & Captions",
    links: [
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
      { href: "/admin/caption-requests", label: "Caption Requests" },
      { href: "/admin/caption-examples", label: "Caption Examples" },
    ],
  },
  {
    title: "Humor System",
    links: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/admin/humor-flavor-mix", label: "Flavor Mix" },
      { href: "/admin/terms", label: "Terms" },
    ],
  },
  {
    title: "LLM System",
    links: [
      { href: "/admin/llm-providers", label: "Providers" },
      { href: "/admin/llm-models", label: "Models" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-model-responses", label: "Responses" },
    ],
  },
];
