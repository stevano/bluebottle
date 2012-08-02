<h2>Search Projects</h2>

<form action="/project/search" class="ajax" method="get">
	<input name="text" type="text" />
	<select name="country__contains">
		<option value="">All countries</option>
		<option value="KE">Kenya</option>
		<option value="UG">Uganda</option>
	</select>

	<h3>Phase</h3>
	<input type="checkbox" id="cb_phases_idea" name="phases[]" value="idea" />
	<label for="cb_phases_idea">
		Idea
	</label><br/>
	<input type="checkbox" id="cb_phases_plan" name="phases[]" value="plan" checked />
	<label for="cb_phases_plan">
		Fund
	</label><br />
	<input type="checkbox" id="cb_phases_act" name="phases[]" value="act" />
	<label for="cb_phases_act">
		Act
	</label><br />
	<input type="checkbox" id="cb_phases_results" name="phases[]" value="results" />
	<label for="cb_phases_results">
		Results
	</label><br />
	
	<h3>Language</h3>
	<input type="checkbox" id="cb_language_nl" name="languages[]" value="nl" checked  />
	<label for="cb_language_nl">
		Dutch
	</label><br/>
	<input type="checkbox" id="cb_language_en" name="languages[]" value="en" checked  />
	<label for="cb_language_en">
		English
	</label><br />
	</label><br />
	

	<input type="submit" value="Search" />
</form>