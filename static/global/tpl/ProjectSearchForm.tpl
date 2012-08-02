<h2>Search Projects</h2>

<form action="/project/search" class="ajax" method="get">
	<input name="text" type="text" />
	<select name="country__contains">
		<option value="">All countries</option>
		<option value="KE">Kenya</option>
		<option value="UG">Uganda</option>
	</select>

	<h3>Phases</h3>
	<input type="checkbox" id="cb_idea" name="phases[]" value="idea" />
	<label for="cb_idea">
		Idea
	</label><br/>
	<input type="checkbox" id="cb_plan" name="phases[]" value="plan" checked />
	<label for="cb_plan">
		Fund
	</label><br />
		<input type="checkbox" id="cb_act" name="phases[]" value="act" />
	<label for="cb_act">
		Act
	</label><br />
	<input type="checkbox" id="cb_results" name="phases[]" value="results" />
	<label for="cb_results">
		Results
	</label><br />
	
	<input type="submit" value="Search" />
</form>