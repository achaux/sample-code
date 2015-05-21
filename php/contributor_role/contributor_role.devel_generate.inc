<?php

/**
 * @file
 * Support for processing contributor/role fields in devel generate.
 */

function contributor_role_devel_generate($object, $field, $instance, $bundle) {
  if (field_behaviors_widget('multiple values', $instance) == FIELD_BEHAVIOR_CUSTOM) {
    return devel_generate_multiple('_contributor_role_devel_generate', $object, $field, $instance, $bundle);
  }
  else {
    return _contributor_role_devel_generate($object, $field, $instance, $bundle);
  }
}

function _contributor_role_devel_generate($object, $field, $instance, $bundle) {
  $object_field = array();

  // Set Contributor.
  $users = devel_get_users();
  // Choose a random user, but don't allow the anonymous user.
  $object_field['uid'] = $users[rand(1, count($users) - 1)];

  // Set Role.
  if ($allowed_values = $field['settings']['role_allowed_values']) {
    $keys = array_keys($allowed_values);
    $object_field['role'] = $keys[mt_rand(0, count($allowed_values) - 1)];
  }

  return $object_field;
}
